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

// ─── SVG logo (inline) ────────────────────────────────────────
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 791.4 173.33" height="20" style="display:block">
  <path fill="#ff6b00" d="M541.84,66.85h-34.44l-.15,16.27h18.32v24.47h-18.32v20.51h34.58v24.47h-61.25V42.38h61.25v24.47Z"/>
  <path fill="#ff6b00" d="M563,42.82h22.42v24.47h-10.11v24.47l42.64-48.94h22.27v81.33h-26.52l2.05-24.18-42.5,52.75h-24.47V42.82h14.21Z"/>
  <path fill="#ff6b00" d="M695.24,42.52v110.19h-27.99v-85.43h-21.69v-24.76h49.67Z"/>
  <path fill="#ff6b00" d="M763.18,66.85h-34.44l-.15,16.27h18.32v24.47h-18.32v20.51h34.58v24.47h-61.25V42.38h61.25v24.47Z"/>
  <path fill="#fff" d="M166.23,42.67h61.1v24.47h-32.53v16.27h18.17v26.67h-18.17v42.64h-28.57s0-110.05,0-110.05Z"/>
  <path fill="#fff" d="M261.69,42.38v28.57h-28.57v-28.57h28.57ZM233.11,77.11h28.57v75.32h-28.57v-75.32Z"/>
  <path fill="#fff" d="M324.27,42.82c31.21,0,54.95,25.64,54.95,54.95s-23.59,54.95-57,54.95-54.95-27.55-54.95-54.95c0-33.41,27.55-54.95,57-54.95ZM324.27,129.13c19.49,0,27.4-17.88,27.4-31.36s-7.91-31.51-27.4-31.51c-19.64,0-29.45,15.83-29.45,31.51s9.82,31.36,29.45,31.36Z"/>
  <path fill="#fff" d="M384.7,42.96h36.05c17.58,0,28.57,2.34,34.87,7.47,8.79,7.47,13.77,17.44,13.77,29.89,0,8.79-2.34,14.8-6.3,19.93-3.66,6.3-8.5,9.96-13.63,12.46l22.42,39.86h-28.72l-29.89-52.31h4.98c7.47,0,13.77-1.17,17.44-3.66,3.96-2.49,6.3-7.47,6.3-13.77,0-5.13-2.34-9.96-6.3-12.46-3.66-2.49-7.33-2.49-12.46-2.49h-9.96v84.7h-28.57V42.96Z"/>
  <path fill="#fff" d="M155.43,20.92H44.16c-10.46,0-19.02,7.57-19.02,16.81v99.7c0,9.25,8.56,16.81,19.02,16.81h96.83c10.46,0,19.02-7.57,19.02-16.81V37.73h14.43c0-9.25-8.56-16.81-19.02-16.81ZM134.76,117.11c0,6.5-5.32,11.81-11.81,11.81h-63.19c-6.5,0-11.81-5.32-11.81-11.81v-60.15c0-6.5,5.32-11.81,11.81-11.81h63.19c6.5,0,11.81,5.32,11.81,11.81v60.15Z"/>
  <rect fill="#ff6b00" x="61.19" y="55.73" width="61.61" height="63.84" rx="30.8" ry="30.8" transform="translate(4.34 179.65) rotate(-90)"/>
</svg>`;

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

  // ── cell: owned vs missing only, no duplicate info ────────────
  function cell(s) {
    const owned = (ss[s.id] || 0) > 0;
    const cls   = owned ? (s.foil ? 'c fo' : 'c ok') : (s.foil ? 'c fm' : 'c');
    return `<div class="${cls}">${s.num}</div>`;
  }

  // ── special section row: index numbers only ───────────────────
  function specialRow(label, color, stickers) {
    const cw = Math.floor(701 / stickers.length);
    return `
<div class="row sp">
  <div class="fc" style="background:${color};color:#fff;font-size:5.5pt;font-weight:900;letter-spacing:.5px;justify-content:center">${label}</div>
  <div class="cn-pad"></div>
  <div class="cw">
    ${stickers.map((s, i) => {
      const owned = (ss[s.id] || 0) > 0;
      const cls   = owned ? 'c fo' : 'c fm';
      return `<div class="${cls}" style="width:${cw}px;min-width:${cw}px;font-size:5pt">${i + 1}</div>`;
    }).join('')}
  </div>
</div>`;
  }

  // ── team row ─────────────────────────────────────────────────
  function teamRow(teamId, isEven) {
    const t   = TEAMS[teamId];
    const stk = buildTeamStickers(t);
    const fc  = t.flagCode;
    return `
<div class="row${isEven ? '' : ' alt'}">
  <div class="fc">
    <img src="https://flagcdn.com/w20/${fc}.png"
         srcset="https://flagcdn.com/w40/${fc}.png 2x"
         width="18" height="12" loading="lazy" alt="${t.shortName}"
         onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'${fc.toUpperCase().slice(0,2)}',className:'ff'}))">
  </div>
  <div class="nm">${t.shortName}</div>
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
@page { size: A4 portrait; margin: 6mm 5mm; }
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: Arial, Helvetica, sans-serif;
  background: #e8e8e8;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.pbt {
  position: fixed; top: 12px; right: 12px; z-index: 999;
  background: #ff6b00; color: #fff; border: none;
  padding: 10px 22px; border-radius: 8px; font-size: 13px;
  font-weight: 700; cursor: pointer; font-family: inherit;
  box-shadow: 0 4px 20px rgba(255,107,0,.45);
}
.pbt:hover { background: #e05a00; }

.pw {
  width: 210mm; min-height: 297mm;
  margin: 0 auto; background: #fff;
  box-shadow: 0 4px 32px rgba(0,0,0,.18);
}

/* ── Header ── */
.hd {
  background: #080808;
  padding: 3mm 5mm;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 3px solid #ff6b00;
}
.hd-left  { display: flex; flex-direction: column; gap: 3px; }
.hd-sub   { font-size: 5pt; color: #555; letter-spacing: .8px; text-transform: uppercase; }
.hd-right { text-align: right; }
.hd-stats { font-size: 5.5pt; color: #555; }
.hd-stats b { color: #ff8c35; }

/* ── Column header ── */
.ch {
  display: flex; align-items: center;
  background: #f7f7f7; border-bottom: 1px solid #eaeaea;
  padding: 0 5mm; height: 11px;
}
.ch-lbl { width: 60px; min-width: 60px; font-size: 4.5pt; font-weight: 700; color: #bbb; }
.chw    { display: flex; flex: 1; }
.cn     { flex: 1; text-align: center; font-size: 4.5pt; color: #ccc; line-height: 11px; }
.cn.hi  { color: #ff8c35; font-weight: 800; }

/* ── Content ── */
.ct { padding: 0 5mm; }

/* ── Group label ── */
.gl {
  background: #f7f7f7; color: #bbb;
  border-left: 2px solid #ff6b00;
  font-size: 4.5pt; font-weight: 900; letter-spacing: 1.2px;
  padding: 1.5px 5px; margin-top: 1px;
}

/* ── Row ── */
.row {
  display: flex; align-items: center;
  height: 13px; border-bottom: .5px solid #f3f3f3;
  background: #fff;
}
.row.alt { background: #fafafa; }
.row.sp  { background: #111; height: 14px; }

/* ── Flag ── */
.fc {
  width: 22px; min-width: 22px;
  display: flex; align-items: center; justify-content: center;
  height: 100%;
}
.fc img { width: 18px; height: 12px; object-fit: cover; border-radius: 1px; display: block; }
.ff { font-size: 4.5pt; font-weight: 800; color: #999; }

/* ── Name ── */
.nm {
  width: 38px; min-width: 38px;
  font-size: 5.5pt; font-weight: 800; color: #333;
  padding: 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.cn-pad { width: 38px; min-width: 38px; }

/* ── Cells ── */
.cw { display: flex; flex: 1; height: 100%; align-items: center; gap: 1px; padding: 1px 0; }

.c {
  flex: 1; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 4.5pt; font-weight: 600; border-radius: 1px;
  border: .5px solid #eeeeee; color: #ddd; background: #fff;
}
.c.ok { background: #d4eedd; border-color: #60b87a; color: #1a6b32; font-weight: 800; }
.c.fo { background: #fef0cc; border-color: #e8b030; color: #8a5f00; font-weight: 800; }
.c.fm { background: #fffcf0; border-color: #e2d8a0; color: #c0a840; }

/* ── Footer ── */
.ft {
  background: #080808;
  border-top: 2px solid #ff6b00;
  padding: 2mm 5mm;
  display: flex; align-items: center; justify-content: space-between;
}
.lg { display: flex; gap: 8px; align-items: center; }
.li { display: flex; align-items: center; gap: 3px; font-size: 5pt; color: #555; }
.ls { width: 8px; height: 8px; border-radius: 1px; border: .8px solid; flex-shrink: 0; }
.fb { color: #444; font-size: 5pt; text-align: right; line-height: 1.6; }
.fb b { color: #ff6b00; }

@media print {
  body { background: #fff; }
  .pw  { box-shadow: none; margin: 0; width: 100%; min-height: 0; }
  .pbt { display: none !important; }
}
</style>
</head>
<body>

<button class="pbt" onclick="window.print()">🖨 Imprimir / Guardar PDF</button>

<div class="pw">

  <div class="hd">
    <div class="hd-left">
      ${LOGO_SVG}
      <div class="hd-sub">Planilla de Control &nbsp;·&nbsp; FIFA World Cup 2026 &nbsp;·&nbsp; ${now}</div>
    </div>
    <div class="hd-right">
      <div class="hd-stats">
        <b>${totalOwned}</b> conseguidas &nbsp;·&nbsp; <b>${totalMissing}</b> faltantes &nbsp;·&nbsp; <b>${pct}%</b>
      </div>
    </div>
  </div>

  <div class="ch">
    <div class="ch-lbl">EQUIPO</div>
    <div class="chw">${colNums}</div>
  </div>

  <div class="ct">
    ${specialRow('ESP',   '#ff6b00', ESPECIALES_STICKERS)}
    ${specialRow('BALÓN', '#e07820', BALON_STICKERS)}
    ${specialRow('HIST',  '#e07820', HISTORIA_STICKERS)}
    ${specialRow('CC',    '#c0392b', COCA_COLA_STICKERS)}
    ${groupsHTML}
  </div>

  <div class="ft">
    <div class="lg">
      <div class="li"><div class="ls" style="background:#d4eedd;border-color:#60b87a"></div>Tengo</div>
      <div class="li"><div class="ls" style="background:#fef0cc;border-color:#e8b030"></div>Brillante</div>
      <div class="li"><div class="ls" style="background:#fffcf0;border-color:#e2d8a0"></div>Brill. faltante</div>
      <div class="li"><div class="ls" style="background:#fff;border-color:#eee"></div>Falta</div>
    </div>
    <div class="fb"><b>markfiorente.com</b><br>FIFA World Cup 2026 Sticker Tracker</div>
  </div>

</div>

</body>
</html>`;
}
