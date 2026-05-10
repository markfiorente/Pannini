// fixture.js — Match fixture tracker: group stage + knockout bracket

import { db } from './firebase-config.js';
import {
  doc, setDoc, updateDoc, onSnapshot, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js';
import { FIXTURES, TEAMS, GROUPS, PHASE_LABELS } from './data.js';

// ── Module state ──────────────────────────────────────────
let currentUser    = null;
let fixtureState   = {};   // match_id → { homeScore, awayScore, played }
let firestoreUnsub = null;
let activeMatch    = null;
let currentPhase   = 'group';

// ── Public API ────────────────────────────────────────────
export async function initFixtures(user) {
  currentUser = user;
  await startFirestoreSync();
  renderGroupStageFixtures();
  setupFixtureTabs();
  setupScoreModal();
}

export function teardownFixtures() {
  if (firestoreUnsub) { firestoreUnsub(); firestoreUnsub = null; }
  currentUser  = null;
  fixtureState = {};
}

export function getFixtureState() { return fixtureState; }

// ── Firestore sync ────────────────────────────────────────
async function startFirestoreSync() {
  const ref = doc(db, 'users', currentUser.uid, 'fixtures', 'results');

  firestoreUnsub = onSnapshot(ref, { includeMetadataChanges: true }, snap => {
    if (snap.exists()) {
      const data = snap.data();
      delete data.lastUpdated;
      fixtureState = data;
    } else {
      fixtureState = {};
      setDoc(ref, { lastUpdated: serverTimestamp() }, { merge: true });
    }
    refreshAllMatchCards();
  });
}

async function writeMatchResult(matchId, homeScore, awayScore, played = true) {
  fixtureState[matchId] = { homeScore, awayScore, played };
  refreshMatchCard(matchId);

  const ref = doc(db, 'users', currentUser.uid, 'fixtures', 'results');
  try {
    await updateDoc(ref, {
      [matchId]: { homeScore, awayScore, played },
      lastUpdated: serverTimestamp(),
    });
  } catch {
    await setDoc(ref, {
      [matchId]: { homeScore, awayScore, played },
      lastUpdated: serverTimestamp(),
    }, { merge: true });
  }
}

async function clearMatchResult(matchId) {
  fixtureState[matchId] = { played: false };
  refreshMatchCard(matchId);

  const ref = doc(db, 'users', currentUser.uid, 'fixtures', 'results');
  try {
    await updateDoc(ref, { [matchId]: { played: false }, lastUpdated: serverTimestamp() });
  } catch {
    await setDoc(ref, { [matchId]: { played: false }, lastUpdated: serverTimestamp() }, { merge: true });
  }
}

// ── Group stage rendering ─────────────────────────────────
function renderGroupStageFixtures() {
  const container = document.getElementById('fixtures-group');
  if (!container) return;
  container.innerHTML = '';

  // Group matches by letter
  const byGroup = {};
  FIXTURES.groupStage.forEach(m => {
    if (!byGroup[m.group]) byGroup[m.group] = [];
    byGroup[m.group].push(m);
  });

  Object.entries(byGroup).forEach(([letter, matches]) => {
    const panel = document.createElement('div');
    panel.className = 'fixture-group-panel';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'fixture-group-toggle';
    toggleBtn.innerHTML = `
      <span class="fg-badge">GRUPO ${letter}</span>
      <span class="fg-teams">${GROUPS[letter].teams.map(id => TEAMS[id].shortName).join(' · ')}</span>
      <span class="fg-arrow">▼</span>
    `;

    const matchesDiv = document.createElement('div');
    matchesDiv.className = 'fixture-group-matches';
    matchesDiv.id = `fg-${letter}`;

    matches.forEach(m => matchesDiv.appendChild(createMatchCard(m)));

    toggleBtn.addEventListener('click', () => {
      const collapsed = matchesDiv.classList.toggle('collapsed');
      toggleBtn.querySelector('.fg-arrow').textContent = collapsed ? '▶' : '▼';
    });

    panel.appendChild(toggleBtn);
    panel.appendChild(matchesDiv);
    container.appendChild(panel);
  });
}

// ── Knockout bracket rendering ────────────────────────────
function renderKnockoutBracket(phaseFilter) {
  const container = document.getElementById('fixtures-knockout');
  if (!container) return;
  container.innerHTML = '';

  const phases = phaseFilter === 'all'
    ? ['r32','r16','qf','sf','third','final']
    : [phaseFilter];

  phases.forEach(ph => {
    const phaseMatches = FIXTURES.knockout.filter(m => m.phase === ph);
    if (!phaseMatches.length) return;

    const phaseSection = document.createElement('div');
    phaseSection.className = 'knockout-phase';
    phaseSection.innerHTML = `<h3 class="phase-title">${PHASE_LABELS[ph] || ph}</h3>`;

    const grid = document.createElement('div');
    grid.className = `knockout-grid phase-${ph}`;

    phaseMatches.forEach(m => grid.appendChild(createKnockoutCard(m)));
    phaseSection.appendChild(grid);
    container.appendChild(phaseSection);
  });
}

// ── Match card (group stage) ──────────────────────────────
function createMatchCard(match) {
  const card = document.createElement('div');
  card.className = 'match-card';
  card.id = `mc-${match.id}`;
  card.dataset.id = match.id;

  const home = TEAMS[match.home];
  const away = TEAMS[match.away];
  const result = fixtureState[match.id];

  card.innerHTML = buildMatchCardHTML(home, away, result, match);
  card.addEventListener('click', () => openScoreModal(match));
  return card;
}

function buildMatchCardHTML(home, away, result, match) {
  const played    = result?.played;
  const scoreHTML = played
    ? `<div class="match-score played">${result.homeScore}<span class="score-sep">-</span>${result.awayScore}</div>`
    : `<div class="match-score">vs</div>`;

  const md = match.matchday ? `<span class="match-md">J${match.matchday}</span>` : '';

  return `
    <div class="match-team home">
      ${flagImg(home, match.homeLabel)}
      <span class="match-team-name">${home?.name || match.homeLabel}</span>
    </div>
    <div class="match-center">
      ${md}
      ${scoreHTML}
      <span class="match-venue">${match.venue || ''}</span>
    </div>
    <div class="match-team away">
      <span class="match-team-name">${away?.name || match.awayLabel}</span>
      ${flagImg(away, match.awayLabel)}
    </div>
  `;
}

// ── Knockout card ─────────────────────────────────────────
function createKnockoutCard(match) {
  const card = document.createElement('div');
  card.className = 'bracket-card';
  card.id = `mc-${match.id}`;
  card.dataset.id = match.id;

  const home   = match.home ? TEAMS[match.home] : null;
  const away   = match.away ? TEAMS[match.away] : null;
  const result = fixtureState[match.id];
  const played = result?.played;

  const winClass = (side) => {
    if (!played) return '';
    if (result.homeScore === result.awayScore) return 'draw';
    return (side === 'home') === (result.homeScore > result.awayScore) ? 'winner' : 'loser';
  };

  card.innerHTML = `
    <div class="bracket-team ${winClass('home')}">
      ${flagImg(home, match.homeLabel)}
      <span>${home?.shortName || match.homeLabel}</span>
      <span class="bracket-score">${played ? result.homeScore : '–'}</span>
    </div>
    <div class="bracket-divider"></div>
    <div class="bracket-team ${winClass('away')}">
      ${flagImg(away, match.awayLabel)}
      <span>${away?.shortName || match.awayLabel}</span>
      <span class="bracket-score">${played ? result.awayScore : '–'}</span>
    </div>
    <div class="bracket-venue">${match.venue || match.slot}</div>
  `;

  card.addEventListener('click', () => openScoreModal(match));
  return card;
}

// ── Refresh helpers ───────────────────────────────────────
function refreshAllMatchCards() {
  document.querySelectorAll('[data-id]').forEach(card => {
    refreshMatchCard(card.dataset.id);
  });
}

function refreshMatchCard(matchId) {
  const card = document.getElementById(`mc-${matchId}`);
  if (!card) return;
  const matchId_ = matchId;
  const match    = FIXTURES.all.find(m => m.id === matchId_);
  if (!match) return;

  const result = fixtureState[matchId];
  const played = result?.played;
  card.classList.toggle('played', !!played);

  if (card.classList.contains('bracket-card')) {
    // Re-render bracket card
    const home = match.home ? TEAMS[match.home] : null;
    const away = match.away ? TEAMS[match.away] : null;
    const winClass = (side) => {
      if (!played) return '';
      if (result.homeScore === result.awayScore) return 'draw';
      return (side === 'home') === (result.homeScore > result.awayScore) ? 'winner' : 'loser';
    };

    card.innerHTML = `
      <div class="bracket-team ${winClass('home')}">
        ${flagImg(home, match.homeLabel)}
        <span>${home?.shortName || match.homeLabel}</span>
        <span class="bracket-score">${played ? result.homeScore : '–'}</span>
      </div>
      <div class="bracket-divider"></div>
      <div class="bracket-team ${winClass('away')}">
        ${flagImg(away, match.awayLabel)}
        <span>${away?.shortName || match.awayLabel}</span>
        <span class="bracket-score">${played ? result.awayScore : '–'}</span>
      </div>
      <div class="bracket-venue">${match.venue || match.slot}</div>
    `;
    card.addEventListener('click', () => openScoreModal(match));
    return;
  }

  // Group-stage match card: update score display
  const scoreEl = card.querySelector('.match-score');
  if (scoreEl) {
    if (played) {
      scoreEl.className = 'match-score played';
      scoreEl.innerHTML = `${result.homeScore}<span class="score-sep">-</span>${result.awayScore}`;
    } else {
      scoreEl.className = 'match-score';
      scoreEl.textContent = 'vs';
    }
  }
}

// ── Score modal ───────────────────────────────────────────
function setupScoreModal() {
  document.getElementById('save-score-btn')?.addEventListener('click', handleSaveScore);
  document.getElementById('clear-score-btn')?.addEventListener('click', handleClearScore);
  document.getElementById('cancel-score-btn')?.addEventListener('click', closeScoreModal);

  document.getElementById('score-modal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeScoreModal();
  });

  ['home-score-input','away-score-input'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', e => {
      const v = parseInt(e.target.value);
      if (isNaN(v) || v < 0) e.target.value = 0;
      if (v > 99) e.target.value = 99;
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeScoreModal();
  });
}

function openScoreModal(match) {
  activeMatch = match;
  const result = fixtureState[match.id];
  const home   = match.home ? TEAMS[match.home] : null;
  const away   = match.away ? TEAMS[match.away] : null;

  // Populate header
  const modalHeader = document.getElementById('modal-match-header');
  if (modalHeader) {
    modalHeader.innerHTML = `
      <div class="modal-team">
        ${flagImg(home, match.homeLabel)}
        <span>${home?.name || match.homeLabel}</span>
      </div>
      <span class="modal-vs">vs</span>
      <div class="modal-team">
        ${flagImg(away, match.awayLabel)}
        <span>${away?.name || match.awayLabel}</span>
      </div>
    `;
  }

  const phaseLabel = document.getElementById('modal-phase-label');
  if (phaseLabel) {
    const grp = match.group ? `Grupo ${match.group} — Jornada ${match.matchday}` : (match.slot || '');
    phaseLabel.textContent = grp;
  }

  // Pre-fill scores
  const homeInput = document.getElementById('home-score-input');
  const awayInput = document.getElementById('away-score-input');
  if (homeInput) homeInput.value = result?.played ? result.homeScore : '';
  if (awayInput) awayInput.value = result?.played ? result.awayScore : '';

  const modal = document.getElementById('score-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('active');
    homeInput?.focus();
  }
}

function closeScoreModal() {
  const modal = document.getElementById('score-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.classList.add('hidden');
  }
  activeMatch = null;
}

async function handleSaveScore() {
  if (!activeMatch) return;
  const homeVal = document.getElementById('home-score-input')?.value;
  const awayVal = document.getElementById('away-score-input')?.value;
  const homeScore = parseInt(homeVal);
  const awayScore = parseInt(awayVal);

  if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
    alert('Por favor ingresa marcadores válidos (números ≥ 0).');
    return;
  }

  await writeMatchResult(activeMatch.id, homeScore, awayScore, true);
  closeScoreModal();
}

async function handleClearScore() {
  if (!activeMatch) return;
  await clearMatchResult(activeMatch.id);
  closeScoreModal();
}

// ── Phase tabs ────────────────────────────────────────────
function setupFixtureTabs() {
  document.querySelectorAll('[data-phase]').forEach(tab => {
    tab.addEventListener('click', () => {
      const phase = tab.dataset.phase;
      currentPhase = phase;

      document.querySelectorAll('[data-phase]').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const groupEl    = document.getElementById('fixtures-group');
      const knockoutEl = document.getElementById('fixtures-knockout');

      if (phase === 'group') {
        groupEl?.classList.remove('hidden');
        knockoutEl?.classList.add('hidden');
      } else {
        groupEl?.classList.add('hidden');
        knockoutEl?.classList.remove('hidden');
        renderKnockoutBracket(phase);
      }
    });
  });
}

// ── Helper: flag image ────────────────────────────────────
function flagImg(team, fallbackLabel = '') {
  if (!team) return `<span class="flag-fb">${fallbackLabel}</span>`;
  return `<img
    src="https://flagcdn.com/w40/${team.flagCode}.png"
    class="match-flag"
    alt="${team.name}"
    loading="lazy"
    onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'flag-fb',textContent:'${team.shortName}'}))"
  >`;
}
