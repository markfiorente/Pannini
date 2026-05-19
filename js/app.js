// app.js — Main application: sticker album, stats, Firestore sync
// Sticker IDs use format: "mexico_1", "intro_3", "museum_7", etc.

import { db } from './firebase-config.js';
import {
  doc, setDoc, updateDoc, onSnapshot, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import {
  TEAMS, GROUPS, TEAM_ORDER, ALBUM_DATA, STICKER_TYPES, TOTAL_STICKERS,
  INTRO_STICKERS, MUSEUM_STICKERS, buildTeamStickers,
} from './data.js';

// ── Module state ──────────────────────────────────────────────
let currentUser    = null;
let stickerState   = {};   // stickerId → count (0=missing, 1=owned, ≥2=duplicates)
let firestoreUnsub = null;
let currentView    = 'album';
let currentFilter  = 'all';
let albumRendered  = false;
let longPressTimer = null;
const LONG_PRESS_MS = 600;

// ── Public API ────────────────────────────────────────────────
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

// ── Firestore sync (or localStorage for demo) ─────────────────
const IS_DEMO = () => currentUser?.uid === 'demo';
const LS_KEY  = 'pannini_stickers';

async function startFirestoreSync() {
  if (IS_DEMO()) {
    try { stickerState = JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { stickerState = {}; }
    refreshAllUI();
    return;
  }

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

async function writeStickerCount(stickerId, count) {
  stickerState[stickerId] = count;
  refreshStickerCard(stickerId);
  refreshProgressBars();
  refreshHeaderCount();

  if (IS_DEMO()) {
    localStorage.setItem(LS_KEY, JSON.stringify(stickerState));
    return;
  }

  const ref = doc(db, 'users', currentUser.uid, 'stickers', 'album');
  try {
    await updateDoc(ref, { [stickerId]: count, lastUpdated: serverTimestamp() });
  } catch {
    await setDoc(ref, { [stickerId]: count, lastUpdated: serverTimestamp() }, { merge: true });
  }
}

// ── Sticker interaction ───────────────────────────────────────
function handleStickerClick(stickerId, displayNum, e) {
  e.preventDefault();
  const count = stickerState[stickerId] || 0;
  const isRightOrLong = e.type === 'contextmenu' || e._isLongPress;
  let newCount;

  if (isRightOrLong) {
    newCount = Math.max(1, count) + 1;
    showToast(`#${displayNum} — ${newCount - 1} repetida${newCount - 1 > 1 ? 's' : ''} 📦`);
  } else {
    newCount = count > 0 ? 0 : 1;
    showToast(newCount > 0 ? `#${displayNum} ¡Conseguida! ✅` : `#${displayNum} Marcada como faltante`);
  }

  writeStickerCount(stickerId, newCount);
  animateStickerPop(stickerId);
}

function attachStickerEvents(card, stickerId, displayNum) {
  card.addEventListener('click',       e => handleStickerClick(stickerId, displayNum, e));
  card.addEventListener('contextmenu', e => { e.preventDefault(); handleStickerClick(stickerId, displayNum, e); });

  card.addEventListener('touchstart', () => {
    longPressTimer = setTimeout(() => {
      handleStickerClick(stickerId, displayNum, { type:'longpress', _isLongPress:true, preventDefault:()=>{} });
      navigator.vibrate?.(50);
    }, LONG_PRESS_MS);
  }, { passive: true });
  card.addEventListener('touchend',  () => clearTimeout(longPressTimer), { passive: true });
  card.addEventListener('touchmove', () => clearTimeout(longPressTimer), { passive: true });
}

function animateStickerPop(stickerId) {
  const card = document.querySelector(`.sticker-card[data-id="${stickerId}"]`);
  if (!card) return;
  card.classList.remove('pop');
  void card.offsetWidth;
  card.classList.add('pop');
  card.addEventListener('animationend', () => card.classList.remove('pop'), { once: true });
}

// ── Album rendering ───────────────────────────────────────────
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
        class="team-flag" alt="${team.name}" loading="lazy"
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
    if (!isCollapsed && grid.childElementCount === 0) {
      buildTeamStickers(team).forEach(s => grid.appendChild(createStickerCard(s)));
      applyCurrentFilter();
    }
  };

  header.addEventListener('click', toggle);
  header.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') toggle(); });
  return block;
}

function createStickerCard(sticker) {
  const card     = document.createElement('div');
  const typeInfo = STICKER_TYPES[sticker.type] || {};
  card.className = `sticker-card${sticker.foil ? ' foil' : ''}`;
  card.dataset.id   = sticker.id;
  card.dataset.num  = sticker.num;
  card.dataset.type = sticker.type || '';
  card.title = `#${sticker.num} – ${sticker.name}`;

  card.innerHTML = `
    <span class="sc-num">#${sticker.num}</span>
    <span class="sc-icon">${typeInfo.icon || ''}</span>
    <span class="sc-label">${typeInfo.label || ''}</span>
    <div class="sc-dup" id="dup-${sticker.id}"></div>
  `;

  attachStickerEvents(card, sticker.id, sticker.num);
  updateStickerCardState(card, sticker.id);
  return card;
}

// ── State refresh ─────────────────────────────────────────────
function refreshAllUI() {
  refreshStickerCards();
  refreshProgressBars();
  refreshHeaderCount();
  if (currentView === 'stats') renderStats();
}

function refreshStickerCards() {
  document.querySelectorAll('.sticker-card').forEach(card => {
    updateStickerCardState(card, card.dataset.id);
  });
}

function refreshStickerCard(stickerId) {
  const card = document.querySelector(`.sticker-card[data-id="${stickerId}"]`);
  if (card) updateStickerCardState(card, stickerId);
}

function updateStickerCardState(card, stickerId) {
  const count = stickerState[stickerId] || 0;
  card.classList.toggle('owned',     count === 1);
  card.classList.toggle('duplicate', count  >  1);
  card.classList.toggle('missing',   count === 0);

  const dupEl = document.getElementById(`dup-${stickerId}`);
  if (dupEl) {
    dupEl.textContent    = count > 1 ? `+${count - 1}` : '';
    dupEl.style.display  = count > 1 ? 'flex' : 'none';
  }
}

function refreshProgressBars() {
  // Intro (9 stickers: intro_1 … intro_9)
  refreshSectionBar('intro', 'intro', 9);
  // Museum (11 stickers: museum_1 … museum_11)
  refreshSectionBar('museum', 'museum', 11);

  // Per team (20 stickers: {teamId}_1 … {teamId}_20)
  TEAM_ORDER.forEach(teamId => {
    let owned = 0;
    for (let n = 1; n <= 20; n++) {
      if ((stickerState[`${teamId}_${n}`] || 0) > 0) owned++;
    }
    const pct    = Math.round((owned / 20) * 100);
    const txtEl  = document.getElementById(`tprog-${teamId}`);
    const fillEl = document.getElementById(`tfill-${teamId}`);
    if (txtEl)  txtEl.textContent  = `${owned}/20`;
    if (fillEl) fillEl.style.width = `${pct}%`;
  });

  // Per group
  Object.entries(GROUPS).forEach(([letter, group]) => {
    let owned = 0;
    const total = group.teams.length * 20;
    group.teams.forEach(teamId => {
      for (let n = 1; n <= 20; n++) {
        if ((stickerState[`${teamId}_${n}`] || 0) > 0) owned++;
      }
    });
    const pct    = Math.round((owned / total) * 100);
    const pctEl  = document.getElementById(`gpct-${letter}`);
    const fillEl = document.getElementById(`gfill-${letter}`);
    if (pctEl)  pctEl.textContent  = `${pct}%`;
    if (fillEl) fillEl.style.width = `${pct}%`;
  });
}

function refreshSectionBar(elId, prefix, total) {
  let owned = 0;
  for (let n = 1; n <= total; n++) {
    if ((stickerState[`${prefix}_${n}`] || 0) > 0) owned++;
  }
  const pct    = Math.round((owned / total) * 100);
  const txtEl  = document.getElementById(`${elId}-count`);
  const fillEl = document.getElementById(`${elId}-fill`);
  if (txtEl)  txtEl.textContent  = `${owned}/${total}`;
  if (fillEl) fillEl.style.width = `${pct}%`;
}

function refreshHeaderCount() {
  const owned = Object.values(stickerState).filter(v => v > 0).length;
  const el = document.getElementById('header-owned');
  if (el) el.textContent = owned;
}

// ── Stats ─────────────────────────────────────────────────────
function renderStats() {
  let totalOwned = 0, totalDupes = 0, totalFoilsOwned = 0;

  // Count intro + museum
  [...INTRO_STICKERS, ...MUSEUM_STICKERS].forEach(s => {
    const count = stickerState[s.id] || 0;
    if (count > 0) { totalOwned++; if (s.foil) totalFoilsOwned++; }
    if (count > 1) totalDupes += count - 1;
  });

  // Count teams
  TEAM_ORDER.forEach(teamId => {
    buildTeamStickers(TEAMS[teamId]).forEach(s => {
      const count = stickerState[s.id] || 0;
      if (count > 0) { totalOwned++; if (s.foil) totalFoilsOwned++; }
      if (count > 1) totalDupes += count - 1;
    });
  });

  const pct = Math.round((totalOwned / TOTAL_STICKERS) * 100);
  setText('stat-pct',        `${pct}%`);
  setText('stat-owned',      totalOwned);
  setText('stat-missing',    TOTAL_STICKERS - totalOwned);
  setText('stat-duplicates', totalDupes);
  setText('stat-foils',      totalFoilsOwned);

  // SVG ring: circumference = 2π × 54 ≈ 339.3
  const ring = document.getElementById('main-ring');
  if (ring) ring.style.strokeDashoffset = 339.3 - (pct / 100) * 339.3;

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
      for (let n = 1; n <= 20; n++) {
        if ((stickerState[`${teamId}_${n}`] || 0) > 0) owned++;
      }
    });
    const pct = Math.round((owned / total) * 100);
    const tr  = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="group-badge-sm">G.${letter}</span></td>
      <td>${group.teams.map(id => TEAMS[id].shortName).join(', ')}</td>
      <td>${owned}</td><td>${total}</td>
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
  const data = TEAM_ORDER.map(teamId => {
    const team = TEAMS[teamId];
    let owned = 0;
    for (let n = 1; n <= 20; n++) {
      if ((stickerState[`${teamId}_${n}`] || 0) > 0) owned++;
    }
    return { team, owned, pct: Math.round((owned / 20) * 100) };
  });
  data.sort((a, b) => b.pct - a.pct);
  container.innerHTML = '';
  data.forEach(({ team, owned, pct }) => {
    const div = document.createElement('div');
    div.className = 'team-stat-card';
    div.innerHTML = `
      <img src="https://flagcdn.com/w40/${team.flagCode}.png" class="ts-flag" alt="${team.name}" onerror="this.style.display='none'">
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

// ── Navigation ────────────────────────────────────────────────
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

// ── Album controls ────────────────────────────────────────────
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
      document.getElementById(val)?.scrollIntoView({ behavior:'smooth', block:'start' });
      e.target.value = '';
    });
  }
}

function handleSearch(e) {
  const query = e.target.value.trim().toLowerCase();
  document.querySelectorAll('.sticker-card').forEach(card => {
    const match = !query || card.dataset.num?.includes(query) || card.title.toLowerCase().includes(query) || card.dataset.id?.includes(query);
    card.classList.toggle('filter-hidden', !match);
  });
}

function applyCurrentFilter() {
  document.querySelectorAll('.sticker-card').forEach(card => {
    const count = stickerState[card.dataset.id] || 0;
    let visible = true;
    if (currentFilter === 'missing')   visible = count === 0;
    if (currentFilter === 'owned')     visible = count >= 1;
    if (currentFilter === 'duplicate') visible = count > 1;
    card.classList.toggle('filter-hidden', !visible);
  });
}

// ── User menu ─────────────────────────────────────────────────
function setupUserMenu() {
  const avatar   = document.getElementById('user-avatar');
  const dropdown = document.getElementById('user-dropdown');
  if (avatar && dropdown) {
    avatar.addEventListener('click', e => { e.stopPropagation(); dropdown.classList.toggle('open'); });
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
    const { getFixtureState } = await import('./fixture.js');
    await exportFixturesPDF(getFixtureState());
  });
}

// ── User UI ───────────────────────────────────────────────────
function updateUserUI(user) {
  const avatarEl = document.getElementById('user-avatar');
  const nameEl   = document.getElementById('user-display-name');
  if (nameEl) nameEl.textContent = user.displayName || user.email || 'Usuario';
  if (avatarEl) {
    avatarEl.src = user.photoURL || generateInitialsAvatar(user);
    avatarEl.alt = user.displayName || 'Usuario';
  }
}

function generateInitialsAvatar(user) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#c8102e';
  ctx.beginPath(); ctx.arc(32, 32, 32, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 26px Arial';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const initials = (user.displayName || user.email || '?')
    .split(/[\s@]/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  ctx.fillText(initials, 32, 33);
  return canvas.toDataURL();
}

// ── Offline indicator ─────────────────────────────────────────
function showOfflineIndicator(isOffline) {
  const el = document.getElementById('offline-dot');
  if (el) {
    el.style.display = isOffline ? 'block' : 'none';
    el.title = isOffline ? 'Modo offline — los cambios se sincronizarán al reconectarte' : '';
  }
}

// ── Toast ─────────────────────────────────────────────────────
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

// ── Utilities ─────────────────────────────────────────────────
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}
