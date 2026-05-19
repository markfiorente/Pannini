// pdf.js — Fiorente brand PDF export (modern card layout)
import {
  TEAMS, GROUPS, TEAM_ORDER, FIXTURES, PHASE_LABELS,
  ESPECIALES_STICKERS, BALON_STICKERS, HISTORIA_STICKERS, COCA_COLA_STICKERS,
  INTRO_STICKERS, MUSEUM_STICKERS, buildTeamStickers,
} from './data.js';

// ─── Brand palette ─────────────────────────────────────────────
const BG       = [5,   5,   5  ];   // #050505
const SURFACE  = [22,  22,  22 ];   // card surface
const SURF2    = [32,  32,  32 ];   // slightly lighter
const SURF3    = [42,  42,  42 ];   // hover-ish
const ORANGE   = [255, 107,  0 ];   // #ff6b00
const GOLD     = [255, 140, 53 ];   // #ff8c35
const GREEN    = [0,   166, 81 ];   // owned
const GRN_BG   = [0,    32, 14 ];   // owned bg
const FOIL_BG  = [52,   26,  0 ];   // brillante owned bg
const MISS_BG  = [17,   17, 17 ];   // missing sticker bg
const MISS_FB  = [20,   10,  0 ];   // missing brillante bg
const WHITE    = [255, 255, 255];
const GRAY     = [80,   80, 80 ];
const GRAY_LT  = [150, 150, 150];

// ─── Main exports ──────────────────────────────────────────────
export async function exportStickersPDF(stickerState) {
  if (!window.jspdf) { alert('jsPDF no disponible.'); return; }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const allStickers = collectAllStickers();
  const totalOwned  = allStickers.filter(s => (stickerState[s.id] || 0) > 0).length;
  const totalDupes  = allStickers.filter(s => (stickerState[s.id] || 0) > 1).length;

  addCoverPage(pdf, 'Mi Colección', `${totalOwned} / 980 laminitas`, false);

  pdf.addPage();
  addSpecialSectionsPage(pdf, stickerState);

  Object.keys(GROUPS).forEach(letter => {
    pdf.addPage();
    addGroupPage(pdf, letter, stickerState);
  });

  if (totalDupes > 0) {
    pdf.addPage();
    addDuplicatesPage(pdf, stickerState);
  }

  pdf.save(`wc2026-coleccion-${timestamp()}.pdf`);
}

export async function exportFixturesPDF(fixtureState) {
  if (!window.jspdf) { alert('jsPDF no disponible.'); return; }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  addCoverPage(pdf, 'Fixture Histórico', 'FIFA World Cup 2026', true);

  pdf.addPage();
  addGroupResultsPage(pdf, fixtureState);

  pdf.addPage();
  addKnockoutPage(pdf, fixtureState);

  pdf.save(`wc2026-fixture-${timestamp()}.pdf`);
}

// ─── Cover page ────────────────────────────────────────────────
function addCoverPage(pdf, title, subtitle, isLandscape) {
  const W = isLandscape ? 297 : 210;
  const H = isLandscape ? 210 : 297;

  fillRect(pdf, 0, 0, W, H, BG);

  // Decorative diagonal band top-right
  pdf.setFillColor(...SURFACE);
  pdf.triangle(W * 0.55, 0, W, 0, W, H * 0.45, 'F');

  // Top accent line
  fillRect(pdf, 0, 0, W, 2, ORANGE);
  // Bottom accent line
  fillRect(pdf, 0, H - 2, W, 2, ORANGE);

  // Brand block
  const bx = isLandscape ? 30 : 20, by = H / 2 - 55;
  fillRect(pdf, bx, by, 12, 12, ORANGE);
  pdf.setTextColor(...BG);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MF', bx + 6, by + 8, { align: 'center' });

  pdf.setTextColor(...WHITE);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('MARKFIORENTE', bx + 16, by + 8);

  // Title
  pdf.setTextColor(...ORANGE);
  pdf.setFontSize(isLandscape ? 28 : 32);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title.toUpperCase(), bx, H / 2 - 12);

  // Subtitle
  pdf.setTextColor(...GRAY_LT);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(subtitle, bx, H / 2 + 5);

  // Thin orange divider
  pdf.setDrawColor(...ORANGE);
  pdf.setLineWidth(0.4);
  pdf.line(bx, H / 2 + 10, bx + 80, H / 2 + 10);

  // Event label
  pdf.setTextColor(...GRAY);
  pdf.setFontSize(8);
  pdf.text('FIFA WORLD CUP 2026', bx, H / 2 + 18);

  // Date + URL bottom
  pdf.setTextColor(...GRAY);
  pdf.setFontSize(7);
  pdf.text(
    `Generado: ${new Date().toLocaleDateString('es')}  ·  markfiorente.com`,
    W / 2, H - 7, { align: 'center' }
  );
}

// ─── Special sections page (Especiales + Balón + Historia + CC) ─
function addSpecialSectionsPage(pdf, stickerState) {
  const W = 210, H = 297;
  fillRect(pdf, 0, 0, W, H, BG);
  addPageHeader(pdf, 'SECCIONES ESPECIALES', W, null, null, null);

  const MX = 10;
  let curY = 26;
  const gap = 5;

  curY = renderStickerSection(pdf, 'ESPECIALES  #00–04', ESPECIALES_STICKERS, MX, curY, W - 2*MX, stickerState, 5, 28) + gap;
  curY = renderStickerSection(pdf, 'BALÓN Y PAÍSES  #05–08', BALON_STICKERS,  MX, curY, W - 2*MX, stickerState, 4, 28) + gap;
  curY = renderStickerSection(pdf, 'HISTORIA  #09–19', HISTORIA_STICKERS,      MX, curY, W - 2*MX, stickerState, 4, 28) + gap;
  renderStickerSection(pdf, 'COCA-COLA  CC1–CC14', COCA_COLA_STICKERS,         MX, curY, W - 2*MX, stickerState, 7, 24);

  addPageFooter(pdf, W, H);
}

function renderStickerSection(pdf, label, stickers, sx, sy, sw, stickerState, cols, cellH) {
  // Section label
  fillRect(pdf, sx, sy, sw, 8, SURFACE);
  fillRect(pdf, sx, sy, 2, 8, ORANGE);
  pdf.setTextColor(...ORANGE);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text(label, sx + 5, sy + 5.5);

  const ownedCount = stickers.filter(s => (stickerState[s.id] || 0) > 0).length;
  pdf.setTextColor(...GRAY_LT);
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${ownedCount} / ${stickers.length}`, sx + sw, sy + 5.5, { align: 'right' });

  const CELL_GAP = 1;
  const cellW = (sw - CELL_GAP * (cols - 1)) / cols;
  const gridY = sy + 10;

  stickers.forEach((s, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const cx = sx + col * (cellW + CELL_GAP);
    const cy = gridY + row * (cellH + CELL_GAP);
    renderStickerCard(pdf, s, cx, cy, cellW, cellH, stickerState);
  });

  const rows = Math.ceil(stickers.length / cols);
  return gridY + rows * (cellH + CELL_GAP);
}

// ─── Group page (2×2 team blocks) ─────────────────────────────
function addGroupPage(pdf, letter, stickerState) {
  const W = 210, H = 297;
  const MX = 10, FOOTER_H = 10, GAP = 5;

  fillRect(pdf, 0, 0, W, H, BG);

  const group = GROUPS[letter];
  const gStickers = group.teams.flatMap(id => buildTeamStickers(TEAMS[id]));
  const gOwned    = gStickers.filter(s => (stickerState[s.id] || 0) > 0).length;
  const gTotal    = gStickers.length;
  const gPct      = Math.round(gOwned / gTotal * 100);

  const HH = 22;
  addPageHeader(pdf, `GRUPO ${letter}`, W, gOwned, gTotal, gPct);

  // Team names subtitle
  const teamNamesStr = group.teams.map(id => TEAMS[id]?.shortName || id).join('  ·  ');
  pdf.setTextColor(...GRAY_LT);
  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text(teamNamesStr, MX + 5, HH - 1);

  const blockW = (W - 2 * MX - GAP) / 2;
  const blockH = (H - HH - MX / 2 - GAP - FOOTER_H) / 2;

  group.teams.forEach((teamId, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = MX + col * (blockW + GAP);
    const by = HH + MX / 2 + row * (blockH + GAP);
    renderTeamBlock(pdf, teamId, bx, by, blockW, blockH, stickerState);
  });

  addPageFooter(pdf, W, H);
}

function renderTeamBlock(pdf, teamId, bx, by, bw, bh, stickerState) {
  const team     = TEAMS[teamId];
  const stickers = buildTeamStickers(team);
  const owned    = stickers.filter(s => (stickerState[s.id] || 0) > 0).length;
  const pct      = Math.round(owned / 20 * 100);
  const complete = owned === 20;

  // Block bg
  fillRect(pdf, bx, by, bw, bh, SURFACE);
  // Left accent
  fillRect(pdf, bx, by, 2, bh, complete ? GREEN : ORANGE);

  // Team header
  const TH = 13;
  fillRect(pdf, bx, by, bw, TH, SURF2);

  // Team name (truncate if needed)
  pdf.setTextColor(...WHITE);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  const name = team.name.length > 16 ? team.name.toUpperCase().slice(0, 15) + '…' : team.name.toUpperCase();
  pdf.text(name, bx + 4, by + TH - 5);

  // Progress
  pdf.setTextColor(...(complete ? GREEN : GOLD));
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${owned}/20`, bx + bw - 2, by + TH - 6, { align: 'right' });
  pdf.setTextColor(...(complete ? GREEN : ORANGE));
  pdf.setFontSize(6);
  pdf.text(`${pct}%`, bx + bw - 2, by + TH - 1, { align: 'right' });

  // Short name
  pdf.setTextColor(...GRAY);
  pdf.setFontSize(5.5);
  pdf.text(team.shortName, bx + 4, by + TH - 1);

  // Progress bar
  const PBH = 2.5;
  fillRect(pdf, bx, by + TH, bw, PBH, SURF3);
  if (owned > 0) fillRect(pdf, bx, by + TH, bw * (owned / 20), PBH, complete ? GREEN : ORANGE);

  // Sticker grid 4×5
  const COLS = 4, ROWS = 5;
  const CELL_GAP = 0.8;
  const gridY = by + TH + PBH + 1.5;
  const gridH = bh - TH - PBH - 1.5 - 0.5;
  const cW = (bw - CELL_GAP * (COLS - 1)) / COLS;
  const cH = (gridH - CELL_GAP * (ROWS - 1)) / ROWS;

  stickers.forEach((s, idx) => {
    const col = idx % COLS;
    const row = Math.floor(idx / COLS);
    const cx = bx + col * (cW + CELL_GAP);
    const cy = gridY + row * (cH + CELL_GAP);
    renderStickerCard(pdf, s, cx, cy, cW, cH, stickerState);
  });
}

// ─── Sticker card renderer (shared) ───────────────────────────
function renderStickerCard(pdf, s, cx, cy, cW, cH, stickerState) {
  const count       = stickerState[s.id] || 0;
  const isOwned     = count > 0;
  const isBrillante = s.foil;
  const isDupe      = count > 1;

  // Background
  let bg;
  if (!isOwned) {
    bg = isBrillante ? MISS_FB : MISS_BG;
  } else {
    bg = isBrillante ? FOIL_BG : GRN_BG;
  }
  fillRect(pdf, cx, cy, cW, cH, bg);

  // Border
  const bdr = !isOwned
    ? (isBrillante ? [38, 20, 0] : [36, 36, 36])
    : (isBrillante ? ORANGE : GREEN);
  pdf.setDrawColor(...bdr);
  pdf.setLineWidth(0.18);
  pdf.rect(cx, cy, cW, cH, 'D');

  // Sticker number — top-left
  const numColor = !isOwned
    ? (isBrillante ? [55, 28, 0] : [58, 58, 58])
    : (isBrillante ? GOLD : [0, 120, 58]);
  pdf.setFontSize(5.5);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(...numColor);
  pdf.text(`${s.num}`, cx + 1.2, cy + 3.8);

  // Center status glyph
  if (isOwned) {
    if (isBrillante) {
      pdf.setFontSize(Math.min(cH * 0.38, 9));
      pdf.setTextColor(...GOLD);
      pdf.text('B', cx + cW / 2, cy + cH / 2 + 2.2, { align: 'center' });
    } else {
      // Small green dot to indicate owned
      pdf.setFillColor(0, 90, 40);
      pdf.circle(cx + cW / 2, cy + cH / 2 + 1, 1.2, 'F');
    }
  }

  // Duplicate badge — top-right
  if (isDupe) {
    const bw2 = 6, bh2 = 3.2;
    fillRect(pdf, cx + cW - bw2 - 0.3, cy + 0.3, bw2, bh2, ORANGE);
    pdf.setFontSize(4);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...WHITE);
    pdf.text(`+${count - 1}`, cx + cW - bw2 / 2 - 0.3, cy + 2.7, { align: 'center' });
  }
}

// ─── Duplicates page ───────────────────────────────────────────
function addDuplicatesPage(pdf, stickerState) {
  const W = 210, H = 297;
  fillRect(pdf, 0, 0, W, H, BG);
  addPageHeader(pdf, 'REPETIDAS', W, null, null, null);

  const MX = 10;
  const dupes = [];

  collectAllStickers().forEach(s => {
    const count = stickerState[s.id] || 0;
    if (count > 1) dupes.push({ s, count });
  });

  const COLS = 6;
  const CELL_GAP = 1.2;
  const cellW = (W - 2 * MX - CELL_GAP * (COLS - 1)) / COLS;
  const cellH = 22;
  let col = 0, curY = 28;

  pdf.setFont('helvetica', 'normal');

  dupes.forEach(({ s, count }) => {
    const cx = MX + col * (cellW + CELL_GAP);
    const cy = curY;

    // Card bg
    fillRect(pdf, cx, cy, cellW, cellH, FOIL_BG);
    pdf.setDrawColor(...ORANGE);
    pdf.setLineWidth(0.2);
    pdf.rect(cx, cy, cellW, cellH, 'D');

    // Count badge top-right
    fillRect(pdf, cx + cellW - 9, cy + 0.5, 8.5, 4, ORANGE);
    pdf.setFontSize(5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...WHITE);
    pdf.text(`×${count}`, cx + cellW - 4.5, cy + 3.5, { align: 'center' });

    // Sticker id label (e.g. MEX #3)
    const sectionId = s.id.split('_');
    const teamId = sectionId.slice(0, -1).join('_');
    const shortName = TEAMS[teamId]?.shortName
      || (teamId === 'intro' ? 'INTRO' : teamId === 'museum' ? 'MUSEO' : teamId.toUpperCase().slice(0, 4));
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...GOLD);
    pdf.text(`${shortName}`, cx + 1.5, cy + 7);

    pdf.setFontSize(9);
    pdf.setTextColor(...WHITE);
    pdf.text(`#${s.num}`, cx + 1.5, cy + 14);

    pdf.setFontSize(5);
    pdf.setTextColor(...GRAY_LT);
    pdf.setFont('helvetica', 'normal');
    const typeLbl = s.foil ? 'BRIL' : (s.type || '').toUpperCase().slice(0, 4);
    pdf.text(typeLbl, cx + 1.5, cy + 19);

    col++;
    if (col >= COLS) {
      col = 0;
      curY += cellH + CELL_GAP;
      if (curY > H - 20) {
        pdf.addPage();
        fillRect(pdf, 0, 0, W, H, BG);
        addPageHeader(pdf, 'REPETIDAS (cont.)', W, null, null, null);
        curY = 28;
      }
    }
  });

  addPageFooter(pdf, W, H);
}

// ─── Fixture: group stage (landscape) ─────────────────────────
function addGroupResultsPage(pdf, fixtureState) {
  const W = 297, H = 210;
  fillRect(pdf, 0, 0, W, H, BG);
  fillRect(pdf, 0, 0, W, 2, ORANGE);
  fillRect(pdf, 0, H - 2, W, 2, ORANGE);

  pdf.setTextColor(...ORANGE);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('FASE DE GRUPOS — RESULTADOS', W / 2, 14, { align: 'center' });

  // 3 cols × 4 rows
  const MX = 10, MY = 18;
  const GCOLS = 3, GROWS = 4;
  const GAP = 5;
  const bW = (W - 2 * MX - GAP * (GCOLS - 1)) / GCOLS;
  const bH = (H - MY - 12 - GAP * (GROWS - 1)) / GROWS;

  Object.keys(GROUPS).forEach((letter, idx) => {
    const col = idx % GCOLS;
    const row = Math.floor(idx / GCOLS);
    const gx = MX + col * (bW + GAP);
    const gy = MY + row * (bH + GAP);
    renderGroupFixtureBlock(pdf, letter, gx, gy, bW, bH, fixtureState);
  });

  addPageFooter(pdf, W, H);
}

function renderGroupFixtureBlock(pdf, letter, gx, gy, gw, gh, fixtureState) {
  fillRect(pdf, gx, gy, gw, gh, SURFACE);

  // Header
  const HH = 8;
  fillRect(pdf, gx, gy, gw, HH, ORANGE);
  pdf.setTextColor(...WHITE);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`GRUPO ${letter}`, gx + 3, gy + 5.5);

  // Count played
  const matches = FIXTURES.groupStage.filter(m => m.group === letter);
  const played  = matches.filter(m => fixtureState[m.id]?.played).length;
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(255, 255, 200);
  pdf.text(`${played}/${matches.length}`, gx + gw - 3, gy + 5.5, { align: 'right' });

  const rowH = (gh - HH) / matches.length;
  matches.forEach((match, i) => {
    const my     = gy + HH + i * rowH;
    const result = fixtureState[match.id];
    const played = result?.played;
    const home   = TEAMS[match.home];
    const away   = TEAMS[match.away];

    // Row bg alternate
    if (i % 2 === 0) fillRect(pdf, gx, my, gw, rowH, SURF2);

    pdf.setFont('helvetica', 'normal');

    if (played) {
      const homeWin = result.homeScore > result.awayScore;
      const awayWin = result.awayScore > result.homeScore;

      // Home
      pdf.setTextColor(...(homeWin ? GREEN : GRAY_LT));
      pdf.setFontSize(6);
      pdf.setFont('helvetica', homeWin ? 'bold' : 'normal');
      pdf.text(home?.shortName || '?', gx + 2, my + rowH * 0.65);

      // Score — center
      pdf.setTextColor(...WHITE);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${result.homeScore} - ${result.awayScore}`, gx + gw / 2, my + rowH * 0.65, { align: 'center' });

      // Away
      pdf.setTextColor(...(awayWin ? GREEN : GRAY_LT));
      pdf.setFontSize(6);
      pdf.setFont('helvetica', awayWin ? 'bold' : 'normal');
      pdf.text(away?.shortName || '?', gx + gw - 2, my + rowH * 0.65, { align: 'right' });
    } else {
      // Not played yet
      pdf.setTextColor(...GRAY);
      pdf.setFontSize(5.5);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `${home?.shortName || '?'}  vs  ${away?.shortName || '?'}`,
        gx + gw / 2, my + rowH * 0.65, { align: 'center' }
      );
    }
  });
}

// ─── Fixture: knockout bracket (landscape) ────────────────────
function addKnockoutPage(pdf, fixtureState) {
  const W = 297, H = 210;
  fillRect(pdf, 0, 0, W, H, BG);
  fillRect(pdf, 0, 0, W, 2, ORANGE);
  fillRect(pdf, 0, H - 2, W, 2, ORANGE);

  pdf.setTextColor(...ORANGE);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BRACKET ELIMINATORIO', W / 2, 14, { align: 'center' });

  const phases   = ['r32', 'r16', 'qf', 'sf', 'final'];
  const colW     = [55, 44, 34, 32, 36];
  const MX       = 8, MY = 18, BOT = 18;
  let xCur       = MX;

  phases.forEach((phase, pi) => {
    const phaseMatches = FIXTURES.knockout.filter(m => m.phase === phase);
    const cW           = colW[pi];
    const availH       = H - MY - BOT;
    const slotH        = availH / phaseMatches.length;

    // Phase label
    fillRect(pdf, xCur, MY - 8, cW - 2, 7, SURF2);
    pdf.setTextColor(...ORANGE);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.text((PHASE_LABELS[phase] || phase).toUpperCase(), xCur + (cW - 2) / 2, MY - 2.5, { align: 'center' });

    phaseMatches.forEach((match, mi) => {
      const topY   = MY + mi * slotH;
      const cardH  = Math.min(slotH - 3, 24);
      const result = fixtureState[match.id];
      const played = result?.played;
      const home   = match.home ? TEAMS[match.home] : null;
      const away   = match.away ? TEAMS[match.away] : null;

      fillRect(pdf, xCur, topY, cW - 2, cardH, SURF2);
      // Left accent
      fillRect(pdf, xCur, topY, 2, cardH, played ? ORANGE : SURF3);

      const halfH = cardH / 2;
      const homeWin = played && result.homeScore > result.awayScore;
      const awayWin = played && result.awayScore > result.homeScore;

      // Home row
      if (homeWin) fillRect(pdf, xCur + 2, topY, cW - 4, halfH, GRN_BG);
      pdf.setTextColor(...(homeWin ? GREEN : (played ? GRAY_LT : GRAY)));
      pdf.setFontSize(5.5);
      pdf.setFont('helvetica', homeWin ? 'bold' : 'normal');
      const homeName = home?.shortName || match.homeLabel || '?';
      pdf.text(homeName, xCur + 3, topY + halfH * 0.65);
      if (played) {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...WHITE);
        pdf.text(String(result.homeScore), xCur + cW - 5, topY + halfH * 0.65);
      }

      // Divider
      pdf.setDrawColor(...SURF3);
      pdf.setLineWidth(0.2);
      pdf.line(xCur + 2, topY + halfH, xCur + cW - 2, topY + halfH);

      // Away row
      if (awayWin) fillRect(pdf, xCur + 2, topY + halfH, cW - 4, halfH, GRN_BG);
      pdf.setTextColor(...(awayWin ? GREEN : (played ? GRAY_LT : GRAY)));
      pdf.setFontSize(5.5);
      pdf.setFont('helvetica', awayWin ? 'bold' : 'normal');
      const awayName = away?.shortName || match.awayLabel || '?';
      pdf.text(awayName, xCur + 3, topY + halfH + halfH * 0.65);
      if (played) {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...WHITE);
        pdf.text(String(result.awayScore), xCur + cW - 5, topY + halfH + halfH * 0.65);
      }
    });

    xCur += cW;
  });

  // Third place match
  const third = FIXTURES.knockout.find(m => m.phase === 'third');
  if (third) {
    const result  = fixtureState[third.id];
    const played3 = result?.played;
    const home    = third.home ? TEAMS[third.home] : null;
    const away    = third.away ? TEAMS[third.away] : null;
    const tx = MX, ty = H - BOT - 2;
    fillRect(pdf, tx, ty, 80, 12, SURF2);
    fillRect(pdf, tx, ty, 2, 12, GOLD);
    pdf.setTextColor(...GOLD);
    pdf.setFontSize(5.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text('3° LUGAR', tx + 4, ty + 4.5);
    pdf.setTextColor(...WHITE);
    pdf.setFont('helvetica', 'normal');
    const score3 = played3 ? `${result.homeScore} - ${result.awayScore}` : 'Por jugar';
    const hn = home?.shortName || third.homeLabel || '?';
    const an = away?.shortName || third.awayLabel || '?';
    pdf.text(`${hn}  ${score3}  ${an}`, tx + 4, ty + 9);
  }

  addPageFooter(pdf, W, H);
}

// ─── Layout helpers ────────────────────────────────────────────
function addPageHeader(pdf, title, W, owned, total, pct) {
  const HH = 22;
  fillRect(pdf, 0, 0, W, HH, SURFACE);
  fillRect(pdf, 0, 0, 3, HH, ORANGE);

  pdf.setTextColor(...ORANGE);
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, 6, HH - 5);

  if (owned !== null && total !== null) {
    const complete = owned === total;
    pdf.setTextColor(...(complete ? GREEN : GRAY_LT));
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${owned}/${total}`, W - 10, HH - 8, { align: 'right' });
    pdf.setTextColor(...(complete ? GREEN : ORANGE));
    pdf.setFontSize(7);
    pdf.text(`${pct}%`, W - 10, HH - 2, { align: 'right' });
  }

  // Thin progress bar under header (if pct provided)
  if (pct !== null) {
    fillRect(pdf, 0, HH, W, 2, SURF3);
    if (pct > 0) fillRect(pdf, 0, HH, W * (pct / 100), 2, ORANGE);
  }
}

function addPageFooter(pdf, W, H) {
  fillRect(pdf, 0, H - 9, W, 9, SURFACE);
  fillRect(pdf, 0, H - 2, W, 2, ORANGE);
  pdf.setTextColor(...GRAY);
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  pdf.text('markfiorente.com  ·  FIFA World Cup 2026 Sticker Tracker', W / 2, H - 4, { align: 'center' });
}

function fillRect(pdf, x, y, w, h, color) {
  pdf.setFillColor(...color);
  pdf.rect(x, y, w, h, 'F');
}

function collectAllStickers() {
  return [
    ...ESPECIALES_STICKERS,
    ...BALON_STICKERS,
    ...HISTORIA_STICKERS,
    ...COCA_COLA_STICKERS,
    ...TEAM_ORDER.flatMap(id => buildTeamStickers(TEAMS[id])),
  ];
}

function timestamp() {
  return new Date().toISOString().slice(0, 10);
}
