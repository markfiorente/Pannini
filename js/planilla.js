// planilla.js — Genera una planilla HTML+CSS para imprimir / guardar como PDF
import {
  TEAMS, GROUPS, TEAM_ORDER,
  ESPECIALES_STICKERS, BALON_STICKERS, HISTORIA_STICKERS, COCA_COLA_STICKERS,
  buildTeamStickers,
} from './data.js';

export function exportPlanillaHTML(stickerState) {
  const html = buildHTML(stickerState);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (!win) alert('Permite popups en tu navegador para generar la planilla.');
  setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

// ─── HTML builder ──────────────────────────────────────────────
function buildHTML(ss) {
  const allStickers = [
    ...ESPECIALES_STICKERS, ...BALON_STICKERS,
    ...HISTORIA_STICKERS,   ...COCA_COLA_STICKERS,
    ...TEAM_ORDER.flatMap(id => buildTeamStickers(TEAMS[id])),
  ];
  const totalOwned   = allStickers.filter(s => (ss[s.id] || 0) > 0).length;
  const totalMissing = allStickers.length - totalOwned;
  const pct          = Math.round(totalOwned / allStickers.length * 100);
  const now          = new Date().toLocaleDateString('es');

  // ── cell ──────────────────────────────────────────────────────
  function cell(s, extraStyle = '') {
    const cnt   = ss[s.id] || 0;
    const owned = cnt > 0, dupe = cnt > 1, foil = s.foil;
    const cls   = dupe ? 'c dp' : owned ? (foil ? 'c fo' : 'c ok') : (foil ? 'c fm' : 'c');
    const lbl   = dupe ? `×${cnt}` : String(s.num);
    return `<div class="${cls}"${extraStyle ? ` style="${extraStyle}"` : ''}>${lbl}</div>`;
  }

  // ── special section row ───────────────────────────────────────
  function specialRow(label, color, stickers) {
    const cw    = Math.floor(701 / stickers.length);
    const owned = stickers.filter(s => (ss[s.id] || 0) > 0).length;
    return `
<div class="row sp">
  <div class="fc" style="background:${color};color:#fff;font-size:6pt;font-weight:900;letter-spacing:.5px;justify-content:center">${label}</div>
  <div class="cc" style="color:${color}">${owned}<span style="color:#555">/${stickers.length}</span></div>
  <div class="cw">
    ${stickers.map(s => {
      const cnt = ss[s.id] || 0, owned = cnt > 0, dupe = cnt > 1;
      const cls = dupe ? 'c dp' : owned ? 'c fo' : 'c fm';
      const lbl = dupe ? `×${cnt}` : (s.shortName || String(s.num));
      return `<div class="${cls}" style="width:${cw}px;min-width:${cw}px;font-size:5.5pt">${lbl}</div>`;
    }).join('')}
  </div>
</div>`;
  }

  // ── team row ─────────────────────────────────────────────────
  function teamRow(teamId, isEven) {
    const t   = TEAMS[teamId];
    const stk = buildTeamStickers(t);
    const own = stk.filter(s => (ss[s.id] || 0) > 0).length;
    const pct = Math.round(own / 20 * 100);
    const fc  = t.flagCode;
    return `
<div class="row${isEven ? '' : ' alt'}">
  <div class="fc">
    <img src="https://flagcdn.com/w20/${fc}.png"
         srcset="https://flagcdn.com/w40/${fc}.png 2x"
         width="18" height="12" loading="lazy" alt="${t.shortName}"
         onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${fc.toUpperCase().slice(0,2)}',className:'ff'}))">
  </div>
  <div class="cc">
    <b>${t.shortName}</b>
    <span class="${pct === 100 ? 'pg ok-t' : 'pg'}">${own}/20</span>
  </div>
  <div class="cw">${stk.map(s => cell(s)).join('')}</div>
</div>`;
  }

  // ── groups ────────────────────────────────────────────────────
  let idx = 0;
  const groupsHTML = Object.entries(GROUPS).map(([letter, g]) => {
    const rows = g.teams.map(tid => teamRow(tid, idx++ % 2 === 0)).join('');
    return `<div class="gb"><div class="gl">GRUPO ${letter}</div>${rows}</div>`;
  }).join('');

  // ── column numbers header ─────────────────────────────────────
  const colNums = Array.from({ length: 20 }, (_, i) =>
    `<div class="cn${i === 0 || i === 12 ? ' hi' : ''}">${i + 1}</div>`
  ).join('');

  return /* html */`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Planilla de Control — FIFA World Cup 2026</title>
<style>
@page { size: A4 portrait; margin: 5mm; }
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: Arial, Helvetica, sans-serif;
  background: #e8e8e8;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ── Screen print button ── */
.pbt {
  position: fixed; top: 12px; right: 12px; z-index: 999;
  background: #ff6b00; color: #fff; border: none;
  padding: 10px 22px; border-radius: 8px; font-size: 13px;
  font-weight: 700; cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 20px rgba(255,107,0,.45);
  transition: background .15s;
}
.pbt:hover { background: #e05a00; }

/* ── Page wrapper ── */
.pw {
  width: 210mm; min-height: 297mm;
  margin: 0 auto; background: #fff;
  box-shadow: 0 4px 32px rgba(0,0,0,.2);
}

/* ── Header ── */
.hd {
  background: #050505;
  padding: 3mm 5mm;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 3px solid #ff6b00;
}
.ht { font-size: 17pt; font-weight: 900; color: #ff6b00; letter-spacing: .5px; line-height: 1; }
.hs { font-size: 6.5pt; color: #888; margin-top: 2px; }
.mf { display: flex; align-items: center; gap: 5px; }
.mfb { background: #ff6b00; color: #050505; font-weight: 900; font-size: 9pt; padding: 2px 6px; border-radius: 3px; }
.mfn { color: #fff; font-weight: 700; font-size: 8pt; }
.st  { color: #777; font-size: 6pt; margin-top: 3px; text-align: right; }
.st b{ color: #ff8c35; }

/* ── Column header ── */
.ch {
  display: flex; align-items: center;
  background: #111; border-bottom: 1px solid #2a2a2a;
  padding: 0 5mm; height: 13px;
}
.che { width: 55px; min-width: 55px; font-size: 5pt; font-weight: 700; color: #555; padding-left: 2px; }
.chw { display: flex; flex: 1; }
.cn  { flex: 1; text-align: center; font-size: 5pt; font-weight: 600; color: #444; line-height: 13px; }
.cn.hi { color: #ff8c35; font-weight: 800; }

/* ── Content ── */
.ct { padding: 0 5mm; }

/* ── Group block ── */
.gb { }
.gl {
  background: #111; color: #ff6b00;
  font-size: 5.5pt; font-weight: 900; letter-spacing: 1px;
  padding: 1px 4px; border-left: 3px solid #ff6b00;
}

/* ── Row ── */
.row {
  display: flex; align-items: center;
  height: 15px; border-bottom: .5px solid #ebebeb;
  background: #fff;
}
.row.alt  { background: #f7f7f7; }
.row.sp   { background: #0d0d0d; height: 16px; }

/* ── Flag col ── */
.fc {
  width: 20px; min-width: 20px;
  display: flex; align-items: center; justify-content: center;
  height: 100%; overflow: hidden;
}
.fc img { width: 18px; height: 12px; object-fit: cover; border-radius: 1px; display: block; }
.ff { font-size: 5pt; font-weight: 800; color: #888; }

/* ── Code col ── */
.cc {
  width: 35px; min-width: 35px;
  display: flex; flex-direction: column; justify-content: center;
  padding: 0 2px; height: 100%;
  font-size: 6.5pt; font-weight: 800; color: #1a1a1a;
}
.cc b   { font-size: 6.5pt; line-height: 1; }
.pg     { font-size: 4.8pt; color: #aaa; font-weight: 400; line-height: 1; }
.pg.ok-t{ color: #2a7a3e; font-weight: 700; }

/* ── Cells wrap ── */
.cw { display: flex; flex: 1; height: 100%; align-items: center; gap: 1px; padding: 1.5px 0; }

/* ── Cells ── */
.c {
  flex: 1; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 5.5pt; font-weight: 600; border-radius: 1px;
  border: .5px solid #e0e0e0; color: #d0d0d0; background: #fff;
}
.c.ok { background: #d6f0de; border-color: #5cb87a; color: #1c6b30; font-weight: 800; }
.c.fo { background: #fff3d6; border-color: #f0a830; color: #8a5f08; font-weight: 800; }
.c.fm { background: #fffbee; border-color: #d4b84a; color: #b0962a; }
.c.dp { background: #ff6b00; border-color: #ff6b00; color: #fff; font-weight: 800; }

/* ── Footer ── */
.ft {
  background: #050505;
  border-top: 2.5px solid #ff6b00;
  padding: 2.5mm 5mm;
  display: flex; align-items: center; justify-content: space-between;
}
.lg { display: flex; gap: 7px; align-items: center; flex-wrap: wrap; }
.li { display: flex; align-items: center; gap: 3px; font-size: 5.5pt; color: #888; }
.ls { width: 9px; height: 9px; border-radius: 1px; border: .8px solid; flex-shrink: 0; }
.fb { color: #555; font-size: 5.5pt; text-align: right; line-height: 1.5; }
.fb b{ color: #ff6b00; }

@media print {
  body  { background: #fff; }
  .pw   { box-shadow: none; margin: 0; width: 100%; min-height: 0; }
  .pbt  { display: none !important; }
}
</style>
</head>
<body>

<button class="pbt" onclick="window.print()">🖨 Imprimir / Guardar PDF</button>

<div class="pw">

  <div class="hd">
    <div>
      <div class="ht">Planilla de Control</div>
      <div class="hs">FIFA WORLD CUP 2026 &nbsp;·&nbsp; ÁLBUM PANINI &nbsp;·&nbsp; ${now}</div>
    </div>
    <div>
      <div class="mf">
        <span class="mfb">MF</span>
        <span class="mfn">MARKFIORENTE</span>
      </div>
      <div class="st">
        <b>${totalOwned}</b> conseguidas &nbsp;·&nbsp;
        <b>${totalMissing}</b> faltantes &nbsp;·&nbsp;
        <b>${pct}%</b> completo
      </div>
    </div>
  </div>

  <div class="ch">
    <div class="che">EQUIPO</div>
    <div class="chw">${colNums}</div>
  </div>

  <div class="ct">
    ${specialRow('ESP', '#ff6b00', ESPECIALES_STICKERS)}
    ${specialRow('BYP', '#ff8c35', BALON_STICKERS)}
    ${specialRow('HIST','#ff8c35', HISTORIA_STICKERS)}
    ${specialRow('CC',  '#c0392b', COCA_COLA_STICKERS)}
    ${groupsHTML}
  </div>

  <div class="ft">
    <div class="lg">
      <div class="li"><div class="ls" style="background:#d6f0de;border-color:#5cb87a"></div>Tengo</div>
      <div class="li"><div class="ls" style="background:#fff3d6;border-color:#f0a830"></div>Brillante</div>
      <div class="li"><div class="ls" style="background:#ff6b00;border-color:#ff6b00"></div>Repetida</div>
      <div class="li"><div class="ls" style="background:#fffbee;border-color:#d4b84a"></div>Brill. faltante</div>
      <div class="li"><div class="ls" style="background:#fff;border-color:#ddd"></div>Falta</div>
    </div>
    <div class="fb">
      <b>markfiorente.com</b><br>FIFA World Cup 2026 Sticker Tracker
    </div>
  </div>

</div>

</body>
</html>`;
}
