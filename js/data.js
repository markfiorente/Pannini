// =============================================================
// ALBUM DATA — FIFA World Cup 2026 Panini Sticker Tracker
// 980 stickers · 48 teams · 12 groups · 104 matches
// =============================================================

// --- Sticker type labels ---
export const STICKER_TYPES = {
  badge: { label: 'ESCUDO', icon: '🛡', foil: true },
  squad: { label: 'EQUIPO', icon: '📸', foil: false },
  gk:    { label: 'PORT',   icon: '🧤', foil: false },
  def:   { label: 'DEF',    icon: '🔵', foil: false },
  mid:   { label: 'MEDIO',  icon: '⚡', foil: false },
  att:   { label: 'DEL',    icon: '⚽', foil: false },
  star:  { label: 'ESTRELLA', icon: '⭐', foil: true },
  special: { label: 'ESPECIAL', icon: '✨', foil: false },
  foil:  { label: 'FOIL',   icon: '🌟', foil: true },
};

// --- Ordered team list (same order as sticker numbers) ---
// 4 teams per group, A→L, 48 teams total
// Team sticker start = 21 + (teamIndex × 20)
export const TEAM_ORDER = [
  // Group A
  'mexico', 'south_africa', 'korea_republic', 'czechia',
  // Group B
  'canada', 'switzerland', 'qatar', 'bosnia_herzegovina',
  // Group C
  'brazil', 'morocco', 'haiti', 'scotland',
  // Group D
  'united_states', 'paraguay', 'australia', 'turkiye',
  // Group E
  'germany', 'curacao', 'cote_divoire', 'ecuador',
  // Group F
  'netherlands', 'japan', 'tunisia', 'sweden',
  // Group G
  'belgium', 'egypt', 'iran', 'new_zealand',
  // Group H
  'spain', 'cabo_verde', 'saudi_arabia', 'uruguay',
  // Group I
  'france', 'senegal', 'norway', 'iraq',
  // Group J
  'argentina', 'algeria', 'austria', 'jordan',
  // Group K
  'portugal', 'uzbekistan', 'colombia', 'congo_dr',
  // Group L
  'england', 'croatia', 'ghana', 'panama',
];

// --- Team metadata ---
// flagCode: ISO 3166-1 alpha-2 for flagcdn.com
export const TEAMS = {
  // GROUP A
  mexico:            { id: 'mexico',            name: 'México',              shortName: 'MEX', group: 'A', flagCode: 'mx',     stickerStart: 21  },
  south_africa:      { id: 'south_africa',      name: 'Sudáfrica',           shortName: 'RSA', group: 'A', flagCode: 'za',     stickerStart: 41  },
  korea_republic:    { id: 'korea_republic',    name: 'Corea del Sur',       shortName: 'KOR', group: 'A', flagCode: 'kr',     stickerStart: 61  },
  czechia:           { id: 'czechia',           name: 'Chequia',             shortName: 'CZE', group: 'A', flagCode: 'cz',     stickerStart: 81  },
  // GROUP B
  canada:            { id: 'canada',            name: 'Canadá',              shortName: 'CAN', group: 'B', flagCode: 'ca',     stickerStart: 101 },
  switzerland:       { id: 'switzerland',       name: 'Suiza',               shortName: 'SUI', group: 'B', flagCode: 'ch',     stickerStart: 121 },
  qatar:             { id: 'qatar',             name: 'Qatar',               shortName: 'QAT', group: 'B', flagCode: 'qa',     stickerStart: 141 },
  bosnia_herzegovina:{ id: 'bosnia_herzegovina',name: 'Bosnia-Herzegovina',  shortName: 'BIH', group: 'B', flagCode: 'ba',     stickerStart: 161 },
  // GROUP C
  brazil:            { id: 'brazil',            name: 'Brasil',              shortName: 'BRA', group: 'C', flagCode: 'br',     stickerStart: 181 },
  morocco:           { id: 'morocco',           name: 'Marruecos',           shortName: 'MAR', group: 'C', flagCode: 'ma',     stickerStart: 201 },
  haiti:             { id: 'haiti',             name: 'Haití',               shortName: 'HAI', group: 'C', flagCode: 'ht',     stickerStart: 221 },
  scotland:          { id: 'scotland',          name: 'Escocia',             shortName: 'SCO', group: 'C', flagCode: 'gb-sct', stickerStart: 241 },
  // GROUP D
  united_states:     { id: 'united_states',     name: 'Estados Unidos',      shortName: 'USA', group: 'D', flagCode: 'us',     stickerStart: 261 },
  paraguay:          { id: 'paraguay',          name: 'Paraguay',            shortName: 'PAR', group: 'D', flagCode: 'py',     stickerStart: 281 },
  australia:         { id: 'australia',         name: 'Australia',           shortName: 'AUS', group: 'D', flagCode: 'au',     stickerStart: 301 },
  turkiye:           { id: 'turkiye',           name: 'Turquía',             shortName: 'TUR', group: 'D', flagCode: 'tr',     stickerStart: 321 },
  // GROUP E
  germany:           { id: 'germany',           name: 'Alemania',            shortName: 'GER', group: 'E', flagCode: 'de',     stickerStart: 341 },
  curacao:           { id: 'curacao',           name: 'Curazao',             shortName: 'CUW', group: 'E', flagCode: 'cw',     stickerStart: 361 },
  cote_divoire:      { id: 'cote_divoire',      name: 'Costa de Marfil',     shortName: 'CIV', group: 'E', flagCode: 'ci',     stickerStart: 381 },
  ecuador:           { id: 'ecuador',           name: 'Ecuador',             shortName: 'ECU', group: 'E', flagCode: 'ec',     stickerStart: 401 },
  // GROUP F
  netherlands:       { id: 'netherlands',       name: 'Países Bajos',        shortName: 'NED', group: 'F', flagCode: 'nl',     stickerStart: 421 },
  japan:             { id: 'japan',             name: 'Japón',               shortName: 'JPN', group: 'F', flagCode: 'jp',     stickerStart: 441 },
  tunisia:           { id: 'tunisia',           name: 'Túnez',               shortName: 'TUN', group: 'F', flagCode: 'tn',     stickerStart: 461 },
  sweden:            { id: 'sweden',            name: 'Suecia',              shortName: 'SWE', group: 'F', flagCode: 'se',     stickerStart: 481 },
  // GROUP G
  belgium:           { id: 'belgium',           name: 'Bélgica',             shortName: 'BEL', group: 'G', flagCode: 'be',     stickerStart: 501 },
  egypt:             { id: 'egypt',             name: 'Egipto',              shortName: 'EGY', group: 'G', flagCode: 'eg',     stickerStart: 521 },
  iran:              { id: 'iran',              name: 'Irán',                shortName: 'IRN', group: 'G', flagCode: 'ir',     stickerStart: 541 },
  new_zealand:       { id: 'new_zealand',       name: 'Nueva Zelanda',       shortName: 'NZL', group: 'G', flagCode: 'nz',     stickerStart: 561 },
  // GROUP H
  spain:             { id: 'spain',             name: 'España',              shortName: 'ESP', group: 'H', flagCode: 'es',     stickerStart: 581 },
  cabo_verde:        { id: 'cabo_verde',        name: 'Cabo Verde',          shortName: 'CPV', group: 'H', flagCode: 'cv',     stickerStart: 601 },
  saudi_arabia:      { id: 'saudi_arabia',      name: 'Arabia Saudita',      shortName: 'KSA', group: 'H', flagCode: 'sa',     stickerStart: 621 },
  uruguay:           { id: 'uruguay',           name: 'Uruguay',             shortName: 'URU', group: 'H', flagCode: 'uy',     stickerStart: 641 },
  // GROUP I
  france:            { id: 'france',            name: 'Francia',             shortName: 'FRA', group: 'I', flagCode: 'fr',     stickerStart: 661 },
  senegal:           { id: 'senegal',           name: 'Senegal',             shortName: 'SEN', group: 'I', flagCode: 'sn',     stickerStart: 681 },
  norway:            { id: 'norway',            name: 'Noruega',             shortName: 'NOR', group: 'I', flagCode: 'no',     stickerStart: 701 },
  iraq:              { id: 'iraq',              name: 'Irak',                shortName: 'IRQ', group: 'I', flagCode: 'iq',     stickerStart: 721 },
  // GROUP J
  argentina:         { id: 'argentina',         name: 'Argentina',           shortName: 'ARG', group: 'J', flagCode: 'ar',     stickerStart: 741 },
  algeria:           { id: 'algeria',           name: 'Argelia',             shortName: 'ALG', group: 'J', flagCode: 'dz',     stickerStart: 761 },
  austria:           { id: 'austria',           name: 'Austria',             shortName: 'AUT', group: 'J', flagCode: 'at',     stickerStart: 781 },
  jordan:            { id: 'jordan',            name: 'Jordania',            shortName: 'JOR', group: 'J', flagCode: 'jo',     stickerStart: 801 },
  // GROUP K
  portugal:          { id: 'portugal',          name: 'Portugal',            shortName: 'POR', group: 'K', flagCode: 'pt',     stickerStart: 821 },
  uzbekistan:        { id: 'uzbekistan',        name: 'Uzbekistán',          shortName: 'UZB', group: 'K', flagCode: 'uz',     stickerStart: 841 },
  colombia:          { id: 'colombia',          name: 'Colombia',            shortName: 'COL', group: 'K', flagCode: 'co',     stickerStart: 861 },
  congo_dr:          { id: 'congo_dr',          name: 'Congo DR',            shortName: 'COD', group: 'K', flagCode: 'cd',     stickerStart: 881 },
  // GROUP L
  england:           { id: 'england',           name: 'Inglaterra',          shortName: 'ENG', group: 'L', flagCode: 'gb-eng', stickerStart: 901 },
  croatia:           { id: 'croatia',           name: 'Croacia',             shortName: 'CRO', group: 'L', flagCode: 'hr',     stickerStart: 921 },
  ghana:             { id: 'ghana',             name: 'Ghana',               shortName: 'GHA', group: 'L', flagCode: 'gh',     stickerStart: 941 },
  panama:            { id: 'panama',            name: 'Panamá',              shortName: 'PAN', group: 'L', flagCode: 'pa',     stickerStart: 961 },
};

// --- Group membership ---
export const GROUPS = {
  A: { teams: ['mexico', 'south_africa', 'korea_republic', 'czechia'] },
  B: { teams: ['canada', 'switzerland', 'qatar', 'bosnia_herzegovina'] },
  C: { teams: ['brazil', 'morocco', 'haiti', 'scotland'] },
  D: { teams: ['united_states', 'paraguay', 'australia', 'turkiye'] },
  E: { teams: ['germany', 'curacao', 'cote_divoire', 'ecuador'] },
  F: { teams: ['netherlands', 'japan', 'tunisia', 'sweden'] },
  G: { teams: ['belgium', 'egypt', 'iran', 'new_zealand'] },
  H: { teams: ['spain', 'cabo_verde', 'saudi_arabia', 'uruguay'] },
  I: { teams: ['france', 'senegal', 'norway', 'iraq'] },
  J: { teams: ['argentina', 'algeria', 'austria', 'jordan'] },
  K: { teams: ['portugal', 'uzbekistan', 'colombia', 'congo_dr'] },
  L: { teams: ['england', 'croatia', 'ghana', 'panama'] },
};

// --- Build sticker list for one team (20 stickers) ---
function buildTeamStickers(team) {
  const s = team.stickerStart;
  return [
    { num: s+0,  name: `${team.name} – Escudo`,         type: 'badge', foil: true  },
    { num: s+1,  name: `${team.name} – Foto de Equipo`, type: 'squad', foil: false },
    { num: s+2,  name: `${team.name} – Portero 1`,      type: 'gk',    foil: false },
    { num: s+3,  name: `${team.name} – Portero 2`,      type: 'gk',    foil: false },
    { num: s+4,  name: `${team.name} – Defensa 1`,      type: 'def',   foil: false },
    { num: s+5,  name: `${team.name} – Defensa 2`,      type: 'def',   foil: false },
    { num: s+6,  name: `${team.name} – Defensa 3`,      type: 'def',   foil: false },
    { num: s+7,  name: `${team.name} – Defensa 4`,      type: 'def',   foil: false },
    { num: s+8,  name: `${team.name} – Defensa 5`,      type: 'def',   foil: false },
    { num: s+9,  name: `${team.name} – Mediocampista 1`,type: 'mid',   foil: false },
    { num: s+10, name: `${team.name} – Mediocampista 2`,type: 'mid',   foil: false },
    { num: s+11, name: `${team.name} – Mediocampista 3`,type: 'mid',   foil: false },
    { num: s+12, name: `${team.name} – Mediocampista 4`,type: 'mid',   foil: false },
    { num: s+13, name: `${team.name} – Mediocampista 5`,type: 'mid',   foil: false },
    { num: s+14, name: `${team.name} – Delantero 1`,    type: 'att',   foil: false },
    { num: s+15, name: `${team.name} – Delantero 2`,    type: 'att',   foil: false },
    { num: s+16, name: `${team.name} – Delantero 3`,    type: 'att',   foil: false },
    { num: s+17, name: `${team.name} – Delantero 4`,    type: 'att',   foil: false },
    { num: s+18, name: `${team.name} – Figura Estrella`,type: 'star',  foil: true  },
    { num: s+19, name: `${team.name} – Delantero 5`,    type: 'att',   foil: false },
  ];
}

// --- Static intro/museum stickers ---
const INTRO_STICKERS = [
  { num: 1,  name: 'Logo del Torneo',        type: 'foil',    foil: true  },
  { num: 2,  name: 'Copa del Mundo FIFA',    type: 'foil',    foil: true  },
  { num: 3,  name: 'Mapa de Sedes',          type: 'special', foil: false },
  { num: 4,  name: 'Logo Sede EE.UU.',       type: 'special', foil: false },
  { num: 5,  name: 'Logo Sede Canadá',       type: 'special', foil: false },
  { num: 6,  name: 'Logo Sede México',       type: 'special', foil: false },
  { num: 7,  name: 'Mascota Oficial',        type: 'special', foil: false },
  { num: 8,  name: 'Balón Oficial',          type: 'special', foil: false },
  { num: 9,  name: 'Ceremonia de Apertura',  type: 'special', foil: false },
];

const MUSEUM_STICKERS = [
  { num: 10, name: 'Museo FIFA',             type: 'foil',    foil: true  },
  { num: 11, name: 'Uruguay 1930',           type: 'special', foil: false },
  { num: 12, name: 'Italia 1934 & 1938',     type: 'special', foil: false },
  { num: 13, name: 'Brasil 1950',            type: 'special', foil: false },
  { num: 14, name: 'Alemania Occ. 1954',     type: 'special', foil: false },
  { num: 15, name: 'Brasil 1958 & 1962',     type: 'special', foil: false },
  { num: 16, name: 'Inglaterra 1966',        type: 'special', foil: false },
  { num: 17, name: 'Brasil 1970',            type: 'special', foil: false },
  { num: 18, name: 'Argentina 1978 & 1986',  type: 'special', foil: false },
  { num: 19, name: 'Alemania 1990 & 2014',   type: 'special', foil: false },
  { num: 20, name: 'Brasil 2002',            type: 'special', foil: false },
];

// --- Build complete album data ---
function buildAlbumData() {
  const teamSections = TEAM_ORDER.map(id => ({
    teamId: id,
    stickers: buildTeamStickers(TEAMS[id]),
  }));

  return {
    intro:   INTRO_STICKERS,
    museum:  MUSEUM_STICKERS,
    teams:   teamSections,
  };
}

export const ALBUM_DATA = buildAlbumData();

// --- Helper: get sticker info by number ---
const _stickerMap = new Map();
function _buildStickerMap() {
  INTRO_STICKERS.forEach(s => _stickerMap.set(s.num, s));
  MUSEUM_STICKERS.forEach(s => _stickerMap.set(s.num, s));
  TEAM_ORDER.forEach(id => {
    buildTeamStickers(TEAMS[id]).forEach(s => _stickerMap.set(s.num, { ...s, teamId: id }));
  });
}
_buildStickerMap();

export function getStickerInfo(num) {
  return _stickerMap.get(num) || null;
}

export function getTeamStickers(teamId) {
  return buildTeamStickers(TEAMS[teamId]);
}

// --- Venues ---
const VENUES = {
  azteca:    'Estadio Azteca, Ciudad de México',
  sofi:      'SoFi Stadium, Los Angeles',
  att:       'AT&T Stadium, Dallas',
  metlife:   'MetLife Stadium, Nueva York',
  levis:     "Levi's Stadium, San Francisco",
  mercedes:  'Mercedes-Benz Stadium, Atlanta',
  hardrock:  'Hard Rock Stadium, Miami',
  arrowhead: 'Arrowhead Stadium, Kansas City',
  gillette:  'Gillette Stadium, Boston',
  lincoln:   'Lincoln Financial Field, Filadelfia',
  bc:        'BC Place, Vancouver',
  bmo:       'BMO Field, Toronto',
  bbva:      'Estadio BBVA, Monterrey',
  akron:     'Estadio Akron, Guadalajara',
};

// --- Generate group stage matches ---
// Pattern per group (6 matches, 3 matchdays):
//   MD1: team[0] vs team[1], team[2] vs team[3]
//   MD2: team[0] vs team[2], team[1] vs team[3]
//   MD3: team[3] vs team[0], team[1] vs team[2]
function genGroup(letter, teams, startId, venueKeys) {
  const pairs = [
    [0,1,1], [2,3,1],
    [0,2,2], [1,3,2],
    [3,0,3], [1,2,3],
  ];
  return pairs.map(([h,a,md], i) => ({
    id: `match_${startId + i}`,
    phase: 'group',
    group: letter,
    home: teams[h],
    away: teams[a],
    matchday: md,
    venue: VENUES[venueKeys[i]] || venueKeys[i],
  }));
}

const groupMatches = [
  ...genGroup('A', GROUPS.A.teams, 1,  ['azteca','att','sofi','metlife','levis','bc']),
  ...genGroup('B', GROUPS.B.teams, 7,  ['bc','azteca','bmo','gillette','hardrock','arrowhead']),
  ...genGroup('C', GROUPS.C.teams, 13, ['metlife','hardrock','att','lincoln','mercedes','sofi']),
  ...genGroup('D', GROUPS.D.teams, 19, ['sofi','gillette','lincoln','att','metlife','mercedes']),
  ...genGroup('E', GROUPS.E.teams, 25, ['mercedes','arrowhead','azteca','hardrock','att','levis']),
  ...genGroup('F', GROUPS.F.teams, 31, ['lincoln','levis','arrowhead','bc','sofi','hardrock']),
  ...genGroup('G', GROUPS.G.teams, 37, ['att','bmo','metlife','bbva','gillette','akron']),
  ...genGroup('H', GROUPS.H.teams, 43, ['hardrock','lincoln','azteca','att','bc','mercedes']),
  ...genGroup('I', GROUPS.I.teams, 49, ['levis','azteca','metlife','arrowhead','att','sofi']),
  ...genGroup('J', GROUPS.J.teams, 55, ['metlife','mercedes','hardrock','gillette','lincoln','bbva']),
  ...genGroup('K', GROUPS.K.teams, 61, ['arrowhead','att','sofi','akron','bmo','metlife']),
  ...genGroup('L', GROUPS.L.teams, 67, ['gillette','sofi','att','azteca','lincoln','hardrock']),
];

// --- Knockout matches ---
const knockoutMatches = [
  // Round of 32 (16 matches: 73–88)
  { id:'match_73',  phase:'r32', slot:'R32-1',  homeLabel:'1A', awayLabel:'2F',  venue: VENUES.metlife  },
  { id:'match_74',  phase:'r32', slot:'R32-2',  homeLabel:'1B', awayLabel:'2E',  venue: VENUES.att      },
  { id:'match_75',  phase:'r32', slot:'R32-3',  homeLabel:'1C', awayLabel:'2D',  venue: VENUES.sofi     },
  { id:'match_76',  phase:'r32', slot:'R32-4',  homeLabel:'1D', awayLabel:'2C',  venue: VENUES.mercedes },
  { id:'match_77',  phase:'r32', slot:'R32-5',  homeLabel:'1E', awayLabel:'2L',  venue: VENUES.hardrock },
  { id:'match_78',  phase:'r32', slot:'R32-6',  homeLabel:'1F', awayLabel:'2K',  venue: VENUES.lincoln  },
  { id:'match_79',  phase:'r32', slot:'R32-7',  homeLabel:'1G', awayLabel:'2J',  venue: VENUES.arrowhead},
  { id:'match_80',  phase:'r32', slot:'R32-8',  homeLabel:'1H', awayLabel:'2I',  venue: VENUES.azteca   },
  { id:'match_81',  phase:'r32', slot:'R32-9',  homeLabel:'1I', awayLabel:'2H',  venue: VENUES.levis    },
  { id:'match_82',  phase:'r32', slot:'R32-10', homeLabel:'1J', awayLabel:'2G',  venue: VENUES.gillette },
  { id:'match_83',  phase:'r32', slot:'R32-11', homeLabel:'1K', awayLabel:'2F',  venue: VENUES.bc       },
  { id:'match_84',  phase:'r32', slot:'R32-12', homeLabel:'1L', awayLabel:'2E',  venue: VENUES.bmo      },
  { id:'match_85',  phase:'r32', slot:'R32-13', homeLabel:'M3°-1', awayLabel:'M3°-2', venue: VENUES.att },
  { id:'match_86',  phase:'r32', slot:'R32-14', homeLabel:'M3°-3', awayLabel:'M3°-4', venue: VENUES.sofi},
  { id:'match_87',  phase:'r32', slot:'R32-15', homeLabel:'M3°-5', awayLabel:'M3°-6', venue: VENUES.metlife},
  { id:'match_88',  phase:'r32', slot:'R32-16', homeLabel:'M3°-7', awayLabel:'M3°-8', venue: VENUES.mercedes},
  // Round of 16 (8 matches: 89–96)
  { id:'match_89',  phase:'r16', slot:'R16-1', homeLabel:'W73', awayLabel:'W74', venue: VENUES.metlife  },
  { id:'match_90',  phase:'r16', slot:'R16-2', homeLabel:'W75', awayLabel:'W76', venue: VENUES.att      },
  { id:'match_91',  phase:'r16', slot:'R16-3', homeLabel:'W77', awayLabel:'W78', venue: VENUES.sofi     },
  { id:'match_92',  phase:'r16', slot:'R16-4', homeLabel:'W79', awayLabel:'W80', venue: VENUES.mercedes },
  { id:'match_93',  phase:'r16', slot:'R16-5', homeLabel:'W81', awayLabel:'W82', venue: VENUES.hardrock },
  { id:'match_94',  phase:'r16', slot:'R16-6', homeLabel:'W83', awayLabel:'W84', venue: VENUES.lincoln  },
  { id:'match_95',  phase:'r16', slot:'R16-7', homeLabel:'W85', awayLabel:'W86', venue: VENUES.arrowhead},
  { id:'match_96',  phase:'r16', slot:'R16-8', homeLabel:'W87', awayLabel:'W88', venue: VENUES.azteca   },
  // Quarterfinals (4 matches: 97–100)
  { id:'match_97',  phase:'qf',  slot:'QF-1',  homeLabel:'W89', awayLabel:'W90', venue: VENUES.att      },
  { id:'match_98',  phase:'qf',  slot:'QF-2',  homeLabel:'W91', awayLabel:'W92', venue: VENUES.mercedes },
  { id:'match_99',  phase:'qf',  slot:'QF-3',  homeLabel:'W93', awayLabel:'W94', venue: VENUES.sofi     },
  { id:'match_100', phase:'qf',  slot:'QF-4',  homeLabel:'W95', awayLabel:'W96', venue: VENUES.metlife  },
  // Semifinals (2 matches: 101–102)
  { id:'match_101', phase:'sf',  slot:'SF-1',  homeLabel:'W97', awayLabel:'W98', venue: VENUES.att      },
  { id:'match_102', phase:'sf',  slot:'SF-2',  homeLabel:'W99', awayLabel:'W100',venue: VENUES.mercedes },
  // Third place (1 match: 103)
  { id:'match_103', phase:'third',slot:'3°',   homeLabel:'L101',awayLabel:'L102',venue: VENUES.azteca   },
  // Final (1 match: 104)
  { id:'match_104', phase:'final',slot:'FINAL',homeLabel:'W101',awayLabel:'W102',venue: VENUES.metlife  },
];

export const FIXTURES = {
  groupStage: groupMatches,
  knockout:   knockoutMatches,
  all:        [...groupMatches, ...knockoutMatches],
};

// --- Phase labels ---
export const PHASE_LABELS = {
  group: 'Fase de Grupos',
  r32:   'Ronda de 32',
  r16:   'Octavos de Final',
  qf:    'Cuartos de Final',
  sf:    'Semifinales',
  third: 'Tercer Lugar',
  final: 'FINAL',
};

export const TOTAL_STICKERS = 980;
