// app.js — Main application: sticker album, stats, Firestore sync

import { db } from './firebase-config.js';
import {
  doc, setDoc, updateDoc, onSnapshot, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import {
  TEAMS, GROUPS, TEAM_ORDER, ALBUM_DATA, STICKER_TYPES, TOTAL_STICKERS, getStickerInfo,
} from './data.js';

// ── Module state ──────────────────────────────────────────
let currentUser    = null;
let stickerState   = {};   // num (string) → count (0=missing, 1=owned, ≥2=duplicates)
let firestoreUnsub = null;
let currentView    = 'album';
let currentFilter  = 'all';
let albumRendered  = false;
let longPressTimer = null;
const LONG_PRESS_MS = 600;

// ── Public API ────────────────────────────────────────────
export async function initApp(user) {
  currentUser = user;
  updateUserUI(user);
  setupNavigation();
  setupAlbumControls();
  setupUserMenu();
  await startFirestoreSync();
  if (!albumRendered) {
    renderAlbum();
    albumRendered = true;
  }
}

export function teardownApp() {
  if (firestoreUnsub) { firestoreUnsub(); firestoreUnsub = null; }
  currentUser  = null;
  stickerState = {};
}

export function getStickerState() { return stickerState; }

// ── Firestore real-time sync ──────────────────────────────
async function startFirestoreSync() {
  const ref = doc(db, 'users', currentUser.uid, 'stickers', 'album');

  firestoreUnsub = onSnapshot(ref, { includeMetadataChanges: true }, snap => {
    if (snap.exists()) {
      const data = snap.data();
      delete data.lastUpdated;
      stickerState = data;
    } else {
      stickerState = {};
      setDoc(ref, { lastUpdated: serverTimestamp() }, { merge: true });
    }
    refreshAllUI();
    showOfflineIndicator(snap.metadata.fromCache && !snap.metadata.hasPendingWrites);
  });
}

async function writeStickerCount(num, count) {
  // Optimistic update first
  stickerState[String(num)] = count;
  refreshStickerCard(num);
  refreshProgressBars();
  refreshHeaderCount();

  const ref = doc(db, 'users', currentUser.uid, 'stickers', 'album');
  try {
    await updateDoc(ref, { [String(num)]: count, lastUpdated: serverTimestamp() });
  } catch {
    // doc may not exist yet (new user)
    await setDoc(ref, { [String(num)]: count, lastUpdated: serverTimestamp() }, { merge: true });
  }
}

// ── Sticker interaction ───────────────────────────────────
function handleStickerClick(num, e) {
  e.preventDefault();
  const count    = stickerState[String(num)] || 0;
  const isRightOrLong = e.type === 'contextmenu' || e._isLongPress;
  let newCount;

  if (isRightOrLong) {
    // Right-click / long-press → add duplicate
    newCount = Math.max(1, count) + 1;
    showToast(`#${num} — ${newCount - 1} repetida${newCount - 1 > 1 ? 's' : ''} 📦`);
  } else {
    // Left-click → toggle owned/missing
    newCount = count > 0 ? 0 : 1;
    showToast(newCount > 0 ? `#${num} ¡Conseguida! ✅` : `#${num} Marcada como faltante`);
  }

  writeStickerCount(num, newCount);
  animateStickerPop(num);
}

function attachStickerEvents(card, num) {
  card.addEventListener('click', e => handleStickerClick(num, e));

  card.addEventListener('contextmenu', e => {
    e.preventDefault();
    handleStickerClick(num, e);
  });

  // Mobile long-press
  card.addEventListener('touchstart', () => {
    longPressTimer = setTimeout(() => {
      const fakeEvent = { type: 'longpress', _isLongPress: true, preventDefault: () => {} };
      handleStickerClick(num, fakeEvent);
      navigator.vibrate?.(50);
    }, LONG_PRESS_MS);
  }, { passive: true });

  card.addEventListener('touchend',  () => clearTimeout(longPressTimer), { passive: true });
  card.addEventListener('touchmove', () => clearTimeout(longPressTimer), { passive: true });
}

function animateStickerPop(num) {
  const card = document.querySelector(`.sticker-card[data-num="${num}"]`);
  if (!card) return;
  card.classList.remove('pop');
  void card.offsetWidth; // reflow
  card.classList.add('pop');
  card.addEventListener('animationend', () => card.classList.remove('pop'), { once: true });
}

// ── Album rendering ───────────────────────────────────────
function renderAlbum() {
  renderSection('intro',  ALBUM_DATA.intro);
  renderSection('museum', ALBUM_DATA.museum);
  renderGroupSections();
}

function renderSection(id, stickers) {
  const grid = document.getElementById(`grid-${id}`);
  if (!grid) return;
  stickers.forEach(s => grid.appendChild(createStickerCard(s)));
}

function renderGroupSections() {
  const container = document.getElementById('album-groups');
  if (!container) return;

  Object.entries(GROUPS).forEach(([letter, group]) => {
    const section = document.createElement('section');
    section.className = 'album-section';
    section.id = `section-group-${letter}`;

    section.innerHTML = `
      <div class="group-header">
        <div class="group-title-row">
          <span class="group-badge">GRUPO ${letter}</span>
          <div class="group-progress-wrap">
            <span class="group-pct" id="gpct-${letter}">0%</span>
            <div class="progress-bar sm"><div class="progress-fill" id="gfill-${letter}"></div></div>
          </div>
        </div>
      </div>
      <div class="teams-row" id="teams-${letter}"></div>
    `;

    const teamsRow = section.querySelector('.teams-row');
    group.teams.forEach(teamId => teamsRow.appendChild(createTeamBlock(teamId)));
    container.appendChild(section);
  });
}

function createTeamBlock(teamId) {
  const team  = TEAMS[teamId];
  const block = document.createElement('div');
  block.className = 'team-block';
  block.id = `team-${teamId}`;

  block.innerHTML = `
    <div class="team-header" role="button" tabindex="0" aria-expanded="false">
      <img
        src="https://flagcdn.com/w40/${team.flagCode}.png"
        srcset="https://flagcdn.com/w80/${team.flagCode}.png 2x"
        class="team-flag"
        alt="${team.name}"
        loading="lazy"
        onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'flag-fb',textContent:'${team.shortName}'}))"
      >
      <div class="team-info">
        <span class="team-name">${team.name}</span>
        <span class="team-short">${team.shortName}</span>
      </div>
      <div class="team-prog-wrap">
        <span class="team-prog-txt" id="tprog-${teamId}">0/20</span>
        <div class="progress-bar sm"><div class="progress-fill" id="tfill-${teamId}"></div></div>
      </div>
      <span class="collapse-icon">▼</span>
    </div>
    <div class="sticker-grid collapsed" id="sgrid-${teamId}"></div>
  `;

  const header = block.querySelector('.team-header');
  const grid   = block.querySelector('.sticker-grid');

  const toggle = () => {
    const isCollapsed = grid.classList.toggle('collapsed');
    header.setAttribute('aria-expanded', String(!isCollapsed));
    header.querySelector('.collapse-icon').textContent = isCollapsed ? '▼' : '▲';

    // Lazy-render stickers on first expand
    if (!isCollapsed && grid.childElementCount === 0) {
      const stickers = buildTeamStickers(team);
      stickers.forEach(s => grid.appendChild(createStickerCard(s)));
      applyCurrentFilter();
    }
  };

  header.addEventListener('click', toggle);
  header.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') toggle(); });

  return block;
}

function buildTeamStickers(team) {
  const s = team.stickerStart;
  const positions = [
    { offset:  0, name: `${team.name} – Escudo`,           type: 'badge', foil: true  },
    { offset:  1, name: `${team.name} – Foto de Equipo`,   type: 'squad', foil: false },
    { offset:  2, name: `${team.name} – Portero 1`,        type: 'gk',    foil: false },
    { offset:  3, name: `${team.name} – Portero 2`,        type: 'gk',    foil: false },
    { offset:  4, name: `${team.name} – Defensa 1`,        type: 'def',   foil: false },
    { offset:  5, name: `${team.name} – Defensa 2`,        type: 'def',   foil: false },
    { offset:  6, name: `${team.name} – Defensa 3`,        type: 'def',   foil: false },
    { offset:  7, name: `${team.name} – Defensa 4`,        type: 'def',   foil: false },
    { offset:  8, name: `${team.name} – Defensa 5`,        type: 'def',   foil: false },
    { offset:  9, name: `${team.name} – Mediocampista 1`,  type: 'mid',   foil: false },
    { offset: 10, name: `${team.name} – Mediocampista 2`,  type: 'mid',   foil: false },
    { offset: 11, name: `${team.name} – Mediocampista 3`,  type: 'mid',   foil: false },
    { offset: 12, name: `${team.name} – Mediocampista 4`,  type: 'mid',   foil: false },
    { offset: 13, name: `${team.name} – Mediocampista 5`,  type: 'mid',   foil: false },
    { offset: 14, name: `${team.name} – Delantero 1`,      type: 'att',   foil: false },
    { offset: 15, name: `${team.name} – Delantero 2`,      type: 'att',   foil: false },
    { offset: 16, name: `${team.name} – Delantero 3`,      type: 'att',   foil: false },
    { offset: 17, name: `${team.name} – Delantero 4`,      type: 'att',   foil: false },
    { offset: 18, name: `${team.name} – Figura Estrella`,  type: 'star',  foil: true  },
    { offset: 19, name: `${team.name} – Delantero 5`,      type: 'att',   foil: false },
  ];
  return positions.map(p => ({ ...p, num: s + p.offset }));
}

function createStickerCard(sticker) {
  const card = document.createElement('div');
  const typeInfo = STICKER_TYPES[sticker.type] || {};
  card.className = `sticker-card${sticker.foil ? ' foil' : ''}`;
  card.dataset.num  = sticker.num;
  card.dataset.type = sticker.type || '';
  card.title = `#${sticker.num} – ${sticker.name}`;

  card.innerHTML = `
    <span class="sc-num">#${sticker.num}</span>
    <span class="sc-icon">${typeInfo.icon || ''}</span>
    <span class="sc-label">${typeInfo.label || sticker.type?.toUpperCase() || ''}</span>
    <div class="sc-dup" id="dup-${sticker.num}"></div>
  `;

  attachStickerEvents(card, sticker.num);
  updateStickerCardState(card, sticker.num);
  return card;
}

// ── State refresh helpers ─────────────────────────────────
function refreshAllUI() {
  refreshStickerCards();
  refreshProgressBars();
  refreshHeaderCount();
  if (currentView === 'stats') renderStats();
}

function refreshStickerCards() {
  document.querySelectorAll('.sticker-card').forEach(card => {
    updateStickerCardState(card, parseInt(card.dataset.num));
  });
}

function refreshStickerCard(num) {
  const card = document.querySelector(`.sticker-card[data-num="${num}"]`);
  if (card) updateStickerCardState(card, num);
}

function updateStickerCardState(card, num) {
  const count = stickerState[String(num)] || 0;
  card.classList.toggle('owned',     count === 1);
  card.classList.toggle('duplicate', count  >  1);
  card.classList.toggle('missing',   count === 0);

  const dupEl = card.querySelector('.sc-dup');
  if (dupEl) {
    dupEl.textContent = count > 1 ? `+${count - 1}` : '';
    dupEl.style.display = count > 1 ? 'flex' : 'none';
  }
}

function refreshProgressBars() {
  // Intro section
  refreshSectionBar('intro', 1, 9);
  // Museum section
  refreshSectionBar('museum', 10, 20);

  // Per team
  TEAM_ORDER.forEach(teamId => {
    const team  = TEAMS[teamId];
    let owned = 0;
    for (let n = team.stickerStart; n < team.stickerStart + 20; n++) {
      if ((stickerState[String(n)] || 0) > 0) owned++;
    }
    const pct = Math.round((owned / 20) * 100);
    const txtEl  = document.getElementById(`tprog-${teamId}`);
    const fillEl = document.getElementById(`tfill-${teamId}`);
    if (txtEl)  txtEl.textContent     = `${owned}/20`;
    if (fillEl) fillEl.style.width    = `${pct}%`;
  });

  // Per group
  Object.entries(GROUPS).forEach(([letter, group]) => {
    let owned = 0;
    const total = group.teams.length * 20;
    group.teams.forEach(teamId => {
      const team = TEAMS[teamId];
      for (let n = team.stickerStart; n < team.stickerStart + 20; n++) {
        if ((stickerState[String(n)] || 0) > 0) owned++;
      }
    });
    const pct = Math.round((owned / total) * 100);
    const pctEl  = document.getElementById(`gpct-${letter}`);
    const fillEl = document.getElementById(`gfill-${letter}`);
    if (pctEl)  pctEl.textContent  = `${pct}%`;
    if (fillEl) fillEl.style.width = `${pct}%`;
  });
}

function refreshSectionBar(id, from, to) {
  let owned = 0;
  const total = to - from + 1;
  for (let n = from; n <= to; n++) {
    if ((stickerState[String(n)] || 0) > 0) owned++;
  }
  const pct = Math.round((owned / total) * 100);
  const txtEl  = document.getElementById(`${id}-count`);
  const fillEl = document.getElementById(`${id}-fill`);
  if (txtEl)  txtEl.textContent  = `${owned}/${total}`;
  if (fillEl) fillEl.style.width = `${pct}%`;
}

function refreshHeaderCount() {
  let owned = 0;
  for (let n = 1; n <= TOTAL_STICKERS; n++) {
    if ((stickerState[String(n)] || 0) > 0) owned++;
  }
  const el = document.getElementById('header-owned');
  if (el) el.textContent = owned;
}

// ── Stats rendering ───────────────────────────────────────
function renderStats() {
  let totalOwned = 0, totalDupes = 0, totalFoilsOwned = 0;
  const foilNums = new Set([1, 2, 10]);
  TEAM_ORDER.forEach(id => {
    const s = TEAMS[id].stickerStart;
    foilNums.add(s);      // badge
    foilNums.add(s + 18); // star
  });

  for (let n = 1; n <= TOTAL_STICKERS; n++) {
    const count = stickerState[String(n)] || 0;
    if (count > 0) { totalOwned++; if (foilNums.has(n)) totalFoilsOwned++; }
    if (count > 1) totalDupes += count - 1;
  }

  const pct = Math.round((totalOwned / TOTAL_STICKERS) * 100);
  setText('stat-pct',        `${pct}%`);
  setText('stat-owned',      totalOwned);
  setText('stat-missing',    TOTAL_STICKERS - totalOwned);
  setText('stat-duplicates', totalDupes);
  setText('stat-foils',      totalFoilsOwned);

  // Animate SVG ring: circumference = 2π × r(54) ≈ 339.3
  const ring = document.getElementById('main-ring');
  if (ring) {
    const offset = 339.3 - (pct / 100) * 339.3;
    ring.style.strokeDashoffset = offset;
  }

  renderGroupsTable();
  renderTeamStatsGrid();
}

function renderGroupsTable() {
  const tbody = document.getElementById('groups-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  Object.entries(GROUPS).forEach(([letter, group]) => {
    let owned = 0;
    const total = group.teams.length * 20;
    group.teams.forEach(teamId => {
      const team = TEAMS[teamId];
      for (let n = team.stickerStart; n < team.stickerStart + 20; n++) {
        if ((stickerState[String(n)] || 0) > 0) owned++;
      }
    });
    const pct = Math.round((owned / total) * 100);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="group-badge-sm">G.${letter}</span></td>
      <td>${group.teams.map(id => TEAMS[id].shortName).join(', ')}</td>
      <td>${owned}</td>
      <td>${total}</td>
      <td>
        <div class="table-bar-wrap">
          <div class="progress-bar sm" style="flex:1">
            <div class="progress-fill" style="width:${pct}%"></div>
          </div>
          <span class="table-pct">${pct}%</span>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderTeamStatsGrid() {
  const container = document.getElementById('team-stats-grid');
  if (!container) return;

  // Sort by completion % descending
  const data = TEAM_ORDER.map(teamId => {
    const team = TEAMS[teamId];
    let owned = 0;
    for (let n = team.stickerStart; n < team.stickerStart + 20; n++) {
      if ((stickerState[String(n)] || 0) > 0) owned++;
    }
    return { teamId, team, owned, pct: Math.round((owned / 20) * 100) };
  });
  data.sort((a, b) => b.pct - a.pct);

  container.innerHTML = '';
  data.forEach(({ team, owned, pct }) => {
    const div = document.createElement('div');
    div.className = 'team-stat-card';
    div.innerHTML = `
      <img
        src="https://flagcdn.com/w40/${team.flagCode}.png"
        class="ts-flag"
        alt="${team.name}"
        onerror="this.style.display='none'"
      >
      <div class="ts-info">
        <span class="ts-name">${team.name}</span>
        <div class="ts-bar-row">
          <div class="progress-bar sm" style="flex:1">
            <div class="progress-fill" style="width:${pct}%"></div>
          </div>
          <span class="ts-count">${owned}/20</span>
        </div>
      </div>
    `;
    container.appendChild(div);
  });
}

// ── Navigation ────────────────────────────────────────────
function setupNavigation() {
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
}

function switchView(viewName) {
  currentView = viewName;
  document.querySelectorAll('.view').forEach(v => {
    v.classList.toggle('active', v.id === `view-${viewName}`);
    v.classList.toggle('hidden', v.id !== `view-${viewName}`);
  });
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });
  if (viewName === 'stats') renderStats();
}

// ── Album controls (search, filter, jump) ─────────────────
function setupAlbumControls() {
  const search = document.getElementById('sticker-search');
  if (search) search.addEventListener('input', debounce(handleSearch, 200));

  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyCurrentFilter();
    });
  });

  const jumpGroup = document.getElementById('jump-group');
  if (jumpGroup) {
    jumpGroup.addEventListener('change', e => {
      const val = e.target.value;
      if (!val) return;
      const target = document.getElementById(val);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      e.target.value = '';
    });
  }
}

function handleSearch(e) {
  const query = e.target.value.trim().toLowerCase();
  document.querySelectorAll('.sticker-card').forEach(card => {
    const num   = card.dataset.num;
    const title = card.title.toLowerCase();
    const match = !query || num.includes(query) || title.includes(query);
    card.classList.toggle('filter-hidden', !match);
  });
}

function applyCurrentFilter() {
  document.querySelectorAll('.sticker-card').forEach(card => {
    const count = stickerState[String(card.dataset.num)] || 0;
    let visible = true;
    if (currentFilter === 'missing')   visible = count === 0;
    if (currentFilter === 'owned')     visible = count >= 1;
    if (currentFilter === 'duplicate') visible = count > 1;
    card.classList.toggle('filter-hidden', !visible);
  });
}

// ── User menu ─────────────────────────────────────────────
function setupUserMenu() {
  const avatar   = document.getElementById('user-avatar');
  const dropdown = document.getElementById('user-dropdown');
  if (avatar && dropdown) {
    avatar.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => dropdown.classList.remove('open'));
  }

  document.getElementById('export-stickers-btn')?.addEventListener('click', async () => {
    dropdown?.classList.remove('open');
    showToast('Generando PDF de figuritas... ⏳');
    const { exportStickersPDF } = await import('./pdf.js');
    await exportStickersPDF(stickerState);
  });

  document.getElementById('export-fixtures-btn')?.addEventListener('click', async () => {
    dropdown?.classList.remove('open');
    showToast('Generando PDF de fixture... ⏳');
    const { exportFixturesPDF } = await import('./pdf.js');
    // fixtureState comes from fixture.js
    const { getFixtureState } = await import('./fixture.js');
    await exportFixturesPDF(getFixtureState());
  });
}

// ── User UI ───────────────────────────────────────────────
function updateUserUI(user) {
  const avatarEl = document.getElementById('user-avatar');
  const nameEl   = document.getElementById('user-display-name');

  if (nameEl) nameEl.textContent = user.displayName || user.email || 'Usuario';

  if (avatarEl) {
    if (user.photoURL) {
      avatarEl.src = user.photoURL;
    } else {
      avatarEl.src = generateInitialsAvatar(user);
    }
    avatarEl.alt = user.displayName || 'Usuario';
  }
}

function generateInitialsAvatar(user) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#c8102e';
  ctx.beginPath();
  ctx.arc(32, 32, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const initials = (user.displayName || user.email || '?')
    .split(/[\s@]/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  ctx.fillText(initials, 32, 33);
  return canvas.toDataURL();
}

// ── Offline indicator ─────────────────────────────────────
function showOfflineIndicator(isOffline) {
  const el = document.getElementById('offline-dot');
  if (el) {
    el.style.display = isOffline ? 'block' : 'none';
    el.title = isOffline ? 'Modo offline — los cambios se sincronizarán al reconectarte' : '';
  }
}

// ── Toast ─────────────────────────────────────────────────
let _toastTimer;
export function showToast(msg, duration = 2500) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.remove('hidden', 'toast-out');
  toast.classList.add('toast-in');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    toast.classList.remove('toast-in');
    toast.classList.add('toast-out');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, duration);
}

// ── Utilities ─────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}
