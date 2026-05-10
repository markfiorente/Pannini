// pdf.js — PDF export: sticker checklist + fixture bracket
// Uses jsPDF (UMD global loaded via CDN in index.html)

import { TEAMS, GROUPS, TEAM_ORDER, FIXTURES, PHASE_LABELS } from './data.js';

const NAVY      = [10, 14, 46];
const NAVY_MID  = [17, 21, 64];
const NAVY_LT   = [26, 32, 96];
const RED       = [200, 16, 46];
const GOLD      = [245, 166, 35];
const GREEN     = [0, 166, 81];
const WHITE     = [255, 255, 255];
const GRAY      = [140, 146, 160];

// ── Sticker Checklist PDF ─────────────────────────────────
export async function exportStickersPDF(stickerState) {
  if (!window.jspdf) { alert('La librería jsPDF no está disponible.'); return; }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  addTitlePage(pdf, 'Álbum de Figuritas', 'FIFA World Cup 2026');
  pdf.addPage();
  addStickerIntroMuseumPage(pdf, stickerState);

  // One page per team (4 columns, 5 rows = 20 stickers)
  let firstTeamPage = true;
  Object.entries(GROUPS).forEach(([letter, group]) => {
    group.teams.forEach(teamId => {
      if (!firstTeamPage) pdf.addPage();
      firstTeamPage = false;
      addTeamPage(pdf, teamId, letter, stickerState);
    });
  });

  // Duplicates summary
  pdf.addPage();
  addDuplicatesPage(pdf, stickerState);

  pdf.save(`wc2026-figuritas-${timestamp()}.pdf`);
}

// ── Fixture PDF ───────────────────────────────────────────
export async function exportFixturesPDF(fixtureState) {
  if (!window.jspdf) { alert('La librería jsPDF no está disponible.'); return; }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  addTitlePage(pdf, 'Fixture Histórico', 'FIFA World Cup 2026');
  pdf.addPage();
  addGroupStageResultsPage(pdf, fixtureState);
  pdf.addPage();
  addKnockoutPage(pdf, fixtureState);

  pdf.save(`wc2026-fixture-${timestamp()}.pdf`);
}

// ── Shared: title page ────────────────────────────────────
function addTitlePage(pdf, title, subtitle) {
  const isLandscape = pdf.internal.pageSize.getWidth() > 250;
  const W = isLandscape ? 297 : 210;
  const H = isLandscape ? 210 : 297;

  // Background
  fillRect(pdf, 0, 0, W, H, NAVY);

  // Decorative radial glow (simulate with rect)
  fillRect(pdf, 0, 0, W, H/2, [12, 16, 50]);

  // Gold accent bar top
  fillRect(pdf, 0, 0, W, 3, GOLD);
  // Red accent bar bottom
  fillRect(pdf, 0, H-3, W, 3, RED);

  // MarkFiorente brand mark (MF box)
  const bx = W/2 - 18, by = H/2 - 50;
  fillRect(pdf, bx, by, 36, 36, GOLD);
  pdf.setTextColor(...NAVY);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MF', bx + 18, by + 24, { align: 'center' });

  // Title
  pdf.setTextColor(...GOLD);
  pdf.setFontSize(28);
  pdf.text(title.toUpperCase(), W/2, H/2, { align: 'center' });

  // Subtitle
  pdf.setTextColor(...WHITE);
  pdf.setFontSize(14);
  pdf.text(subtitle, W/2, H/2 + 14, { align: 'center' });

  // URL line
  pdf.setTextColor(...RED);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('markfiorente.com', W/2, H/2 + 30, { align: 'center' });

  // Date
  pdf.setTextColor(...GRAY);
  pdf.setFontSize(8);
  pdf.text(`Generado: ${new Date().toLocaleDateString('es')}`, W/2, H - 10, { align: 'center' });
}

// ── Intro + Museum page ───────────────────────────────────
function addStickerIntroMuseumPage(pdf, stickerState) {
  const W = 210, H = 297;
  fillRect(pdf, 0, 0, W, H, NAVY);
  pageHeader(pdf, 'INTRODUCCIÓN & MUSEO FIFA', W);

  const stickers = [
    ...Array.from({length: 9},  (_, i) => ({ num: i+1,  label: getStickerLabel(i+1),  section: 'INTRO' })),
    ...Array.from({length: 11}, (_, i) => ({ num: i+10, label: getStickerLabel(i+10), section: 'MUSEO' })),
  ];

  const cols = 5, rowH = 14, startY = 32, cellW = (W - 24) / cols;

  // Section label: INTRO
  pdf.setTextColor(...GOLD);
  pdf.setFontSize(9);
  pdf.text('INTRODUCCIÓN (Figuritas 1–9)', 12, startY - 2);

  stickers.forEach((s, idx) => {
    if (idx === 9) {
      const sepY = startY + Math.ceil(9 / cols) * rowH + 4;
      pdf.setTextColor(...GOLD);
      pdf.setFontSize(9);
      pdf.text('MUSEO FIFA (Figuritas 10–20)', 12, sepY - 2);
    }
    const sectionOffset = idx >= 9 ? 6 : 0;
    const adjustedIdx   = idx >= 9 ? idx : idx;
    const col = adjustedIdx % cols;
    const row = Math.floor(adjustedIdx / cols);
    const x = 12 + col * cellW;
    const y = startY + row * rowH + sectionOffset;

    const count = stickerState[String(s.num)] || 0;
    const owned = count > 0;
    fillRect(pdf, x, y, cellW - 2, rowH - 2, owned ? [0, 50, 25] : NAVY_MID);
    pdf.setTextColor(...(owned ? GREEN : GRAY));
    pdf.setFontSize(7);
    pdf.text(`#${s.num}`, x + 1, y + 5);
    pdf.setTextColor(...(owned ? WHITE : GRAY));
    pdf.setFontSize(6);
    const labelTrunc = s.label.substring(0, 22);
    pdf.text(labelTrunc, x + 1, y + 10);
    if (owned) {
      pdf.setTextColor(...GREEN);
      pdf.setFontSize(10);
      pdf.text('✓', x + cellW - 5, y + 8);
    }
  });

  pageFooter(pdf, W, H);
}

// ── Team page ─────────────────────────────────────────────
function addTeamPage(pdf, teamId, groupLetter, stickerState) {
  const W = 210, H = 297;
  const team = TEAMS[teamId];

  fillRect(pdf, 0, 0, W, H, NAVY);

  // Group band top
  fillRect(pdf, 0, 0, W, 12, RED);
  pdf.setTextColor(...WHITE);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`GRUPO ${groupLetter}`, 12, 8);

  // Team name band
  fillRect(pdf, 0, 12, W, 16, NAVY_LT);
  pdf.setTextColor(...GOLD);
  pdf.setFontSize(18);
  pdf.text(team.name.toUpperCase(), 12, 25);

  // Short + progress
  const stNums = Array.from({length: 20}, (_, i) => team.stickerStart + i);
  const owned  = stNums.filter(n => (stickerState[String(n)] || 0) > 0).length;
  pdf.setTextColor(...WHITE);
  pdf.setFontSize(10);
  pdf.text(`${team.shortName}`, W - 12, 20, { align: 'right' });
  pdf.setTextColor(...(owned === 20 ? GREEN : GRAY));
  pdf.setFontSize(9);
  pdf.text(`${owned}/20 figuritas`, W - 12, 27, { align: 'right' });

  // Sticker table header
  const tStartY = 36;
  const cols = { num: 12, type: 26, name: 50, owned: 165, dupes: 182 };
  fillRect(pdf, 12, tStartY - 6, W - 24, 8, NAVY_MID);
  pdf.setTextColor(...GOLD);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('#',        cols.num,   tStartY - 1);
  pdf.text('Tipo',     cols.type,  tStartY - 1);
  pdf.text('Nombre',   cols.name,  tStartY - 1);
  pdf.text('Tengo',    cols.owned, tStartY - 1);
  pdf.text('Rept.',    cols.dupes, tStartY - 1);

  // Sticker rows
  const types = [
    'Escudo','Foto Equipo','Portero 1','Portero 2',
    'Defensa 1','Defensa 2','Defensa 3','Defensa 4','Defensa 5',
    'Mediocampista 1','Mediocampista 2','Mediocampista 3','Mediocampista 4','Mediocampista 5',
    'Delantero 1','Delantero 2','Delantero 3','Delantero 4','Figura Estrella','Delantero 5',
  ];
  const typeShort = [
    'ESCUDO','SQUAD','PORT','PORT',
    'DEF','DEF','DEF','DEF','DEF',
    'MED','MED','MED','MED','MED',
    'DEL','DEL','DEL','DEL','⭐','DEL',
  ];
  const rowH = 11;
  pdf.setFont('helvetica', 'normal');

  stNums.forEach((num, i) => {
    const count  = stickerState[String(num)] || 0;
    const isOwned = count > 0;
    const y = tStartY + 3 + i * rowH;

    // Row bg
    fillRect(pdf, 12, y - 7, W - 24, rowH - 1,
      isOwned ? [0, 45, 20] : (i % 2 === 0 ? NAVY_MID : [14, 18, 55]));

    pdf.setTextColor(...(isOwned ? GREEN : GRAY));
    pdf.setFontSize(7);
    pdf.text(String(num), cols.num, y - 1);

    pdf.setTextColor(...GRAY);
    pdf.text(typeShort[i], cols.type, y - 1);

    pdf.setTextColor(...WHITE);
    pdf.text(types[i], cols.name, y - 1);

    pdf.setTextColor(...(isOwned ? GREEN : [80, 80, 80]));
    pdf.setFontSize(9);
    pdf.text(isOwned ? '✓' : '□', cols.owned, y - 1);

    if (count > 1) {
      pdf.setTextColor(...GOLD);
      pdf.setFontSize(7);
      pdf.text(`+${count-1}`, cols.dupes, y - 1);
    }
  });

  pageFooter(pdf, W, H);
}

// ── Duplicates summary page ───────────────────────────────
function addDuplicatesPage(pdf, stickerState) {
  const W = 210, H = 297;
  fillRect(pdf, 0, 0, W, H, NAVY);
  pageHeader(pdf, 'FIGURITAS REPETIDAS', W);

  const dupes = [];
  for (let n = 1; n <= 980; n++) {
    const count = stickerState[String(n)] || 0;
    if (count > 1) dupes.push({ num: n, count });
  }

  if (dupes.length === 0) {
    pdf.setTextColor(...GRAY);
    pdf.setFontSize(12);
    pdf.text('¡Sin repetidas por ahora!', W/2, 80, { align: 'center' });
    pageFooter(pdf, W, H);
    return;
  }

  const cols = 5, cellW = (W - 24) / cols, cellH = 14;
  let col = 0, y = 40;

  pdf.setFont('helvetica', 'normal');
  dupes.forEach(({ num, count }) => {
    const x = 12 + col * cellW;
    fillRect(pdf, x, y - 9, cellW - 2, cellH, [55, 35, 5]);
    pdf.setTextColor(...GOLD);
    pdf.setFontSize(8);
    pdf.text(`#${num}`, x + 2, y - 3);
    pdf.setTextColor(...WHITE);
    pdf.setFontSize(7);
    pdf.text(`×${count-1} extra`, x + 2, y + 2);

    col++;
    if (col >= cols) { col = 0; y += cellH + 2; }
    if (y > H - 20) { pdf.addPage(); fillRect(pdf, 0, 0, W, H, NAVY); y = 20; }
  });

  pageFooter(pdf, W, H);
}

// ── Group stage results (landscape) ──────────────────────
function addGroupStageResultsPage(pdf, fixtureState) {
  const W = 297, H = 210;
  fillRect(pdf, 0, 0, W, H, NAVY);
  fillRect(pdf, 0, 0, W, 3, GOLD);
  fillRect(pdf, 0, H-3, W, 3, RED);

  pdf.setTextColor(...GOLD);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RESULTADOS — FASE DE GRUPOS', W/2, 14, { align: 'center' });

  // 3 columns × 4 rows of groups
  const colW = (W - 24) / 3;
  const rowH = (H - 28) / 4;
  const groups = Object.keys(GROUPS);

  groups.forEach((letter, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x   = 12 + col * colW;
    const y   = 20 + row * rowH;
    renderGroupBlock(pdf, letter, x, y, colW - 4, rowH - 4, fixtureState);
  });

  pageFooterLandscape(pdf, W, H);
}

function renderGroupBlock(pdf, letter, x, y, w, h, fixtureState) {
  fillRect(pdf, x, y, w, h, NAVY_MID);
  fillRect(pdf, x, y, w, 8, RED);
  pdf.setTextColor(...WHITE);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`GRUPO ${letter}`, x + 2, y + 6);

  const groupMatches = FIXTURES.groupStage.filter(m => m.group === letter);
  pdf.setFont('helvetica', 'normal');
  groupMatches.forEach((match, i) => {
    const my     = y + 12 + i * 7;
    const result = fixtureState[match.id];
    const home   = TEAMS[match.home];
    const away   = TEAMS[match.away];
    const score  = result?.played ? `${result.homeScore} - ${result.awayScore}` : 'Por jugar';

    pdf.setFontSize(6);
    pdf.setTextColor(...(result?.played ? WHITE : GRAY));
    pdf.text(`${home?.shortName || '?'} ${score} ${away?.shortName || '?'}`, x + 2, my);
  });
}

// ── Knockout bracket page (landscape) ────────────────────
function addKnockoutPage(pdf, fixtureState) {
  const W = 297, H = 210;
  fillRect(pdf, 0, 0, W, H, NAVY);
  fillRect(pdf, 0, 0, W, 3, GOLD);
  fillRect(pdf, 0, H-3, W, 3, RED);

  pdf.setTextColor(...GOLD);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BRACKET ELIMINATORIO', W/2, 14, { align: 'center' });

  const phases  = ['r32','r16','qf','sf','final'];
  const colWidths = [52, 40, 30, 30, 34];
  let xCursor   = 10;
  const availH  = H - 28;

  phases.forEach((phase, pi) => {
    const phaseMatches = FIXTURES.knockout.filter(m => m.phase === phase);
    const cW   = colWidths[pi];
    const slotH = availH / phaseMatches.length;

    // Phase label
    pdf.setTextColor(...GOLD);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text(PHASE_LABELS[phase] || phase, xCursor + cW/2, 20, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    phaseMatches.forEach((match, mi) => {
      const topY   = 22 + mi * slotH;
      const cardH  = Math.min(slotH - 4, 20);
      const result = fixtureState[match.id];
      const played = result?.played;
      const home   = match.home ? TEAMS[match.home] : null;
      const away   = match.away ? TEAMS[match.away] : null;

      fillRect(pdf, xCursor, topY, cW - 2, cardH, NAVY_LT);

      // Home row
      const homeWin = played && result.homeScore > result.awayScore;
      const awayWin = played && result.awayScore > result.homeScore;

      pdf.setTextColor(...(homeWin ? [0, 220, 100] : WHITE));
      pdf.setFontSize(5.5);
      const homeName = home?.shortName || match.homeLabel;
      pdf.text(homeName, xCursor + 2, topY + 5);
      if (played) {
        pdf.text(String(result.homeScore), xCursor + cW - 5, topY + 5);
      }

      // Divider
      pdf.setDrawColor(...NAVY_MID);
      pdf.line(xCursor, topY + cardH/2, xCursor + cW - 2, topY + cardH/2);

      // Away row
      pdf.setTextColor(...(awayWin ? [0, 220, 100] : WHITE));
      const awayName = away?.shortName || match.awayLabel;
      pdf.text(awayName, xCursor + 2, topY + cardH - 3);
      if (played) {
        pdf.text(String(result.awayScore), xCursor + cW - 5, topY + cardH - 3);
      }
    });

    xCursor += cW;
  });

  // Third place separately
  const thirdMatch = FIXTURES.knockout.find(m => m.phase === 'third');
  if (thirdMatch) {
    const result = fixtureState[thirdMatch.id];
    const played = result?.played;
    const home   = thirdMatch.home ? TEAMS[thirdMatch.home] : null;
    const away   = thirdMatch.away ? TEAMS[thirdMatch.away] : null;
    const y3     = H - 26;
    fillRect(pdf, 10, y3, 80, 14, [40, 30, 0]);
    pdf.setTextColor(...GOLD);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text('3° LUGAR', 12, y3 + 5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...WHITE);
    const score = played ? `${result.homeScore} - ${result.awayScore}` : 'Por jugar';
    pdf.text(`${home?.shortName || thirdMatch.homeLabel} ${score} ${away?.shortName || thirdMatch.awayLabel}`, 12, y3 + 11);
  }

  pageFooterLandscape(pdf, W, H);
}

// ── Layout helpers ────────────────────────────────────────
function fillRect(pdf, x, y, w, h, color) {
  pdf.setFillColor(...color);
  pdf.rect(x, y, w, h, 'F');
}

function pageHeader(pdf, title, W) {
  fillRect(pdf, 0, 0, W, 24, NAVY_MID);
  fillRect(pdf, 0, 0, W, 3, GOLD);
  pdf.setTextColor(...GOLD);
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, W/2, 17, { align: 'center' });
}

function pageFooter(pdf, W, H) {
  fillRect(pdf, 0, H - 10, W, 10, NAVY_MID);
  fillRect(pdf, 0, H - 3, W, 3, RED);
  pdf.setTextColor(...GRAY);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('markfiorente.com  ·  FIFA World Cup 2026 Sticker Tracker', W/2, H - 4, { align: 'center' });
}

function pageFooterLandscape(pdf, W, H) {
  pageFooter(pdf, W, H);
}

function getStickerLabel(num) {
  const labels = {
    1: 'Logo del Torneo', 2: 'Copa del Mundo', 3: 'Mapa de Sedes',
    4: 'Logo EE.UU.', 5: 'Logo Canadá', 6: 'Logo México',
    7: 'Mascota Oficial', 8: 'Balón Oficial', 9: 'Ceremonia Apertura',
    10: 'Museo FIFA', 11: 'Uruguay 1930', 12: 'Italia 1934/38',
    13: 'Brasil 1950', 14: 'Alemania 1954', 15: 'Brasil 1958/62',
    16: 'Inglaterra 1966', 17: 'Brasil 1970', 18: 'Argentina 1978/86',
    19: 'Alemania 1990/14', 20: 'Brasil 2002',
  };
  return labels[num] || `Figurita #${num}`;
}

function timestamp() {
  return new Date().toISOString().slice(0, 10);
}
