// =============================================================
// ALBUM DATA — FIFA World Cup 2026 Panini Sticker Tracker
// 980 stickers · 48 teams · 12 groups · 104 matches
// Numbering restarts per section/team (badge=1, squad=13, star=19)
// =============================================================

export const STICKER_TYPES = {
  badge:   { label: 'ESCUDO',    icon: '🛡', foil: true  },
  squad:   { label: 'EQUIPO',    icon: '📸', foil: false },
  gk:      { label: 'PORT',      icon: '🧤', foil: false },
  def:     { label: 'DEF',       icon: '🔵', foil: false },
  mid:     { label: 'MEDIO',     icon: '⚡', foil: false },
  att:     { label: 'DEL',       icon: '⚽', foil: false },
  star:    { label: 'ESTRELLA',  icon: '⭐', foil: true  },
  special: { label: 'ESPECIAL',  icon: '✨', foil: false },
  foil:    { label: 'BRILLANTE', icon: '✨', foil: true  },
};

// ── Team order (same as sticker album sequence) ───────────────
export const TEAM_ORDER = [
  'mexico','south_africa','korea_republic','czechia',
  'canada','switzerland','qatar','bosnia_herzegovina',
  'brazil','morocco','haiti','scotland',
  'united_states','paraguay','australia','turkiye',
  'germany','curacao','cote_divoire','ecuador',
  'netherlands','japan','tunisia','sweden',
  'belgium','egypt','iran','new_zealand',
  'spain','cabo_verde','saudi_arabia','uruguay',
  'france','senegal','norway','iraq',
  'argentina','algeria','austria','jordan',
  'portugal','uzbekistan','colombia','congo_dr',
  'england','croatia','ghana','panama',
];

// ── Team metadata (no stickerStart — numbering is local 1–20) ─
export const TEAMS = {
  // GROUP A
  mexico:             { id:'mexico',            name:'México',             shortName:'MEX', group:'A', flagCode:'mx'     },
  south_africa:       { id:'south_africa',      name:'Sudáfrica',          shortName:'RSA', group:'A', flagCode:'za'     },
  korea_republic:     { id:'korea_republic',    name:'Corea del Sur',      shortName:'KOR', group:'A', flagCode:'kr'     },
  czechia:            { id:'czechia',           name:'Chequia',            shortName:'CZE', group:'A', flagCode:'cz'     },
  // GROUP B
  canada:             { id:'canada',            name:'Canadá',             shortName:'CAN', group:'B', flagCode:'ca'     },
  switzerland:        { id:'switzerland',       name:'Suiza',              shortName:'SUI', group:'B', flagCode:'ch'     },
  qatar:              { id:'qatar',             name:'Qatar',              shortName:'QAT', group:'B', flagCode:'qa'     },
  bosnia_herzegovina: { id:'bosnia_herzegovina',name:'Bosnia-Herzegovina', shortName:'BIH', group:'B', flagCode:'ba'     },
  // GROUP C
  brazil:             { id:'brazil',            name:'Brasil',             shortName:'BRA', group:'C', flagCode:'br'     },
  morocco:            { id:'morocco',           name:'Marruecos',          shortName:'MAR', group:'C', flagCode:'ma'     },
  haiti:              { id:'haiti',             name:'Haití',              shortName:'HAI', group:'C', flagCode:'ht'     },
  scotland:           { id:'scotland',          name:'Escocia',            shortName:'SCO', group:'C', flagCode:'gb-sct' },
  // GROUP D
  united_states:      { id:'united_states',     name:'Estados Unidos',     shortName:'USA', group:'D', flagCode:'us'     },
  paraguay:           { id:'paraguay',          name:'Paraguay',           shortName:'PAR', group:'D', flagCode:'py'     },
  australia:          { id:'australia',         name:'Australia',          shortName:'AUS', group:'D', flagCode:'au'     },
  turkiye:            { id:'turkiye',           name:'Turquía',            shortName:'TUR', group:'D', flagCode:'tr'     },
  // GROUP E
  germany:            { id:'germany',           name:'Alemania',           shortName:'GER', group:'E', flagCode:'de'     },
  curacao:            { id:'curacao',           name:'Curazao',            shortName:'CUW', group:'E', flagCode:'cw'     },
  cote_divoire:       { id:'cote_divoire',      name:'Costa de Marfil',    shortName:'CIV', group:'E', flagCode:'ci'     },
  ecuador:            { id:'ecuador',           name:'Ecuador',            shortName:'ECU', group:'E', flagCode:'ec'     },
  // GROUP F
  netherlands:        { id:'netherlands',       name:'Países Bajos',       shortName:'NED', group:'F', flagCode:'nl'     },
  japan:              { id:'japan',             name:'Japón',              shortName:'JPN', group:'F', flagCode:'jp'     },
  tunisia:            { id:'tunisia',           name:'Túnez',              shortName:'TUN', group:'F', flagCode:'tn'     },
  sweden:             { id:'sweden',            name:'Suecia',             shortName:'SWE', group:'F', flagCode:'se'     },
  // GROUP G
  belgium:            { id:'belgium',           name:'Bélgica',            shortName:'BEL', group:'G', flagCode:'be'     },
  egypt:              { id:'egypt',             name:'Egipto',             shortName:'EGY', group:'G', flagCode:'eg'     },
  iran:               { id:'iran',              name:'Irán',               shortName:'IRN', group:'G', flagCode:'ir'     },
  new_zealand:        { id:'new_zealand',       name:'Nueva Zelanda',      shortName:'NZL', group:'G', flagCode:'nz'     },
  // GROUP H
  spain:              { id:'spain',             name:'España',             shortName:'ESP', group:'H', flagCode:'es'     },
  cabo_verde:         { id:'cabo_verde',        name:'Cabo Verde',         shortName:'CPV', group:'H', flagCode:'cv'     },
  saudi_arabia:       { id:'saudi_arabia',      name:'Arabia Saudita',     shortName:'KSA', group:'H', flagCode:'sa'     },
  uruguay:            { id:'uruguay',           name:'Uruguay',            shortName:'URU', group:'H', flagCode:'uy'     },
  // GROUP I
  france:             { id:'france',            name:'Francia',            shortName:'FRA', group:'I', flagCode:'fr'     },
  senegal:            { id:'senegal',           name:'Senegal',            shortName:'SEN', group:'I', flagCode:'sn'     },
  norway:             { id:'norway',            name:'Noruega',            shortName:'NOR', group:'I', flagCode:'no'     },
  iraq:               { id:'iraq',              name:'Irak',               shortName:'IRQ', group:'I', flagCode:'iq'     },
  // GROUP J
  argentina:          { id:'argentina',         name:'Argentina',          shortName:'ARG', group:'J', flagCode:'ar'     },
  algeria:            { id:'algeria',           name:'Argelia',            shortName:'ALG', group:'J', flagCode:'dz'     },
  austria:            { id:'austria',           name:'Austria',            shortName:'AUT', group:'J', flagCode:'at'     },
  jordan:             { id:'jordan',            name:'Jordania',           shortName:'JOR', group:'J', flagCode:'jo'     },
  // GROUP K
  portugal:           { id:'portugal',          name:'Portugal',           shortName:'POR', group:'K', flagCode:'pt'     },
  uzbekistan:         { id:'uzbekistan',        name:'Uzbekistán',         shortName:'UZB', group:'K', flagCode:'uz'     },
  colombia:           { id:'colombia',          name:'Colombia',           shortName:'COL', group:'K', flagCode:'co'     },
  congo_dr:           { id:'congo_dr',          name:'Congo DR',           shortName:'COD', group:'K', flagCode:'cd'     },
  // GROUP L
  england:            { id:'england',           name:'Inglaterra',         shortName:'ENG', group:'L', flagCode:'gb-eng' },
  croatia:            { id:'croatia',           name:'Croacia',            shortName:'CRO', group:'L', flagCode:'hr'     },
  ghana:              { id:'ghana',             name:'Ghana',              shortName:'GHA', group:'L', flagCode:'gh'     },
  panama:             { id:'panama',            name:'Panamá',             shortName:'PAN', group:'L', flagCode:'pa'     },
};

// ── Groups ────────────────────────────────────────────────────
export const GROUPS = {
  A: { teams:['mexico','south_africa','korea_republic','czechia']              },
  B: { teams:['canada','switzerland','qatar','bosnia_herzegovina']             },
  C: { teams:['brazil','morocco','haiti','scotland']                           },
  D: { teams:['united_states','paraguay','australia','turkiye']                },
  E: { teams:['germany','curacao','cote_divoire','ecuador']                    },
  F: { teams:['netherlands','japan','tunisia','sweden']                        },
  G: { teams:['belgium','egypt','iran','new_zealand']                          },
  H: { teams:['spain','cabo_verde','saudi_arabia','uruguay']                   },
  I: { teams:['france','senegal','norway','iraq']                              },
  J: { teams:['argentina','algeria','austria','jordan']                        },
  K: { teams:['portugal','uzbekistan','colombia','congo_dr']                   },
  L: { teams:['england','croatia','ghana','panama']                            },
};

// ── Build sticker list for one team ───────────────────────────
// 20 stickers per team, local numbering 1–20
// #1  = Escudo (badge, foil)
// #13 = Foto de Equipo (squad photo)
// #19 = Estrella (star, foil)
export function buildTeamStickers(team) {
  const t = team.id;
  return [
    { num:  1, id:`${t}_1`,  name:`${team.name} – Escudo`,          type:'badge', foil:true  },
    { num:  2, id:`${t}_2`,  name:`${team.name} – Portero 1`,       type:'gk',   foil:false },
    { num:  3, id:`${t}_3`,  name:`${team.name} – Portero 2`,       type:'gk',   foil:false },
    { num:  4, id:`${t}_4`,  name:`${team.name} – Defensa 1`,       type:'def',  foil:false },
    { num:  5, id:`${t}_5`,  name:`${team.name} – Defensa 2`,       type:'def',  foil:false },
    { num:  6, id:`${t}_6`,  name:`${team.name} – Defensa 3`,       type:'def',  foil:false },
    { num:  7, id:`${t}_7`,  name:`${team.name} – Defensa 4`,       type:'def',  foil:false },
    { num:  8, id:`${t}_8`,  name:`${team.name} – Defensa 5`,       type:'def',  foil:false },
    { num:  9, id:`${t}_9`,  name:`${team.name} – Mediocampista 1`, type:'mid',  foil:false },
    { num: 10, id:`${t}_10`, name:`${team.name} – Mediocampista 2`, type:'mid',  foil:false },
    { num: 11, id:`${t}_11`, name:`${team.name} – Mediocampista 3`, type:'mid',  foil:false },
    { num: 12, id:`${t}_12`, name:`${team.name} – Mediocampista 4`, type:'mid',  foil:false },
    { num: 13, id:`${t}_13`, name:`${team.name} – Foto de Equipo`,  type:'squad',foil:false },
    { num: 14, id:`${t}_14`, name:`${team.name} – Mediocampista 5`, type:'mid',  foil:false },
    { num: 15, id:`${t}_15`, name:`${team.name} – Delantero 1`,     type:'att',  foil:false },
    { num: 16, id:`${t}_16`, name:`${team.name} – Delantero 2`,     type:'att',  foil:false },
    { num: 17, id:`${t}_17`, name:`${team.name} – Delantero 3`,     type:'att',  foil:false },
    { num: 18, id:`${t}_18`, name:`${team.name} – Delantero 4`,     type:'att',  foil:false },
    { num: 19, id:`${t}_19`, name:`${team.name} – Estrella`,        type:'star', foil:true  },
    { num: 20, id:`${t}_20`, name:`${team.name} – Delantero 5`,     type:'att',  foil:false },
  ];
}

// ── Intro stickers (local numbering 1–9) ──────────────────────
export const INTRO_STICKERS = [
  { num:1, id:'intro_1', name:'Logo del Torneo',       type:'foil',    foil:true  },
  { num:2, id:'intro_2', name:'Copa del Mundo FIFA',   type:'foil',    foil:true  },
  { num:3, id:'intro_3', name:'Mapa de Sedes',         type:'special', foil:false },
  { num:4, id:'intro_4', name:'Logo Sede EE.UU.',      type:'special', foil:false },
  { num:5, id:'intro_5', name:'Logo Sede Canadá',      type:'special', foil:false },
  { num:6, id:'intro_6', name:'Logo Sede México',      type:'special', foil:false },
  { num:7, id:'intro_7', name:'Mascota Oficial',       type:'special', foil:false },
  { num:8, id:'intro_8', name:'Balón Oficial',         type:'special', foil:false },
  { num:9, id:'intro_9', name:'Ceremonia de Apertura', type:'special', foil:false },
];

// ── Museo FIFA stickers (local numbering 1–11) ────────────────
export const MUSEUM_STICKERS = [
  { num: 1, id:'museum_1',  name:'Museo FIFA',            type:'foil',    foil:true  },
  { num: 2, id:'museum_2',  name:'Uruguay 1930',          type:'special', foil:false },
  { num: 3, id:'museum_3',  name:'Italia 1934 & 1938',    type:'special', foil:false },
  { num: 4, id:'museum_4',  name:'Brasil 1950',           type:'special', foil:false },
  { num: 5, id:'museum_5',  name:'Alemania Occ. 1954',    type:'special', foil:false },
  { num: 6, id:'museum_6',  name:'Brasil 1958 & 1962',    type:'special', foil:false },
  { num: 7, id:'museum_7',  name:'Inglaterra 1966',       type:'special', foil:false },
  { num: 8, id:'museum_8',  name:'Brasil 1970',           type:'special', foil:false },
  { num: 9, id:'museum_9',  name:'Argentina 1978 & 1986', type:'special', foil:false },
  { num:10, id:'museum_10', name:'Alemania 1990 & 2014',  type:'special', foil:false },
  { num:11, id:'museum_11', name:'Brasil 2002',           type:'special', foil:false },
];

// ── Album data ────────────────────────────────────────────────
function buildAlbumData() {
  return {
    intro:  INTRO_STICKERS,
    museum: MUSEUM_STICKERS,
    teams:  TEAM_ORDER.map(id => ({ teamId:id, stickers:buildTeamStickers(TEAMS[id]) })),
  };
}
export const ALBUM_DATA = buildAlbumData();

// ── Sticker lookup by id (e.g. "mexico_1", "intro_3") ─────────
const _stickerMap = new Map();
(function _buildMap() {
  INTRO_STICKERS.forEach(s => _stickerMap.set(s.id, s));
  MUSEUM_STICKERS.forEach(s => _stickerMap.set(s.id, s));
  TEAM_ORDER.forEach(teamId => {
    buildTeamStickers(TEAMS[teamId]).forEach(s => _stickerMap.set(s.id, { ...s, teamId }));
  });
})();

export function getStickerInfo(id) {
  return _stickerMap.get(id) || null;
}

export function getTeamStickers(teamId) {
  return buildTeamStickers(TEAMS[teamId]);
}

// ── Totals ────────────────────────────────────────────────────
// 9 intro + 11 museum + 48 teams × 20 = 980
export const TOTAL_STICKERS = 980;

// ── Venues ────────────────────────────────────────────────────
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

// ── Group stage matches ───────────────────────────────────────
function genGroup(letter, teams, startId, venueKeys) {
  const pairs = [[0,1,1],[2,3,1],[0,2,2],[1,3,2],[3,0,3],[1,2,3]];
  return pairs.map(([h,a,md], i) => ({
    id: `match_${startId + i}`,
    phase: 'group', group: letter,
    home: teams[h], away: teams[a],
    matchday: md,
    venue: VENUES[venueKeys[i]] || venueKeys[i],
  }));
}

const groupMatches = [
  ...genGroup('A', GROUPS.A.teams,  1, ['azteca','att','sofi','metlife','levis','bc']),
  ...genGroup('B', GROUPS.B.teams,  7, ['bc','azteca','bmo','gillette','hardrock','arrowhead']),
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

// ── Knockout matches ──────────────────────────────────────────
const knockoutMatches = [
  // Round of 32 (16 matches)
  {id:'match_73', phase:'r32',  slot:'R32-1',   homeLabel:'1A',    awayLabel:'2F',    venue:VENUES.metlife  },
  {id:'match_74', phase:'r32',  slot:'R32-2',   homeLabel:'1B',    awayLabel:'2E',    venue:VENUES.att      },
  {id:'match_75', phase:'r32',  slot:'R32-3',   homeLabel:'1C',    awayLabel:'2D',    venue:VENUES.sofi     },
  {id:'match_76', phase:'r32',  slot:'R32-4',   homeLabel:'1D',    awayLabel:'2C',    venue:VENUES.mercedes },
  {id:'match_77', phase:'r32',  slot:'R32-5',   homeLabel:'1E',    awayLabel:'2L',    venue:VENUES.hardrock },
  {id:'match_78', phase:'r32',  slot:'R32-6',   homeLabel:'1F',    awayLabel:'2K',    venue:VENUES.lincoln  },
  {id:'match_79', phase:'r32',  slot:'R32-7',   homeLabel:'1G',    awayLabel:'2J',    venue:VENUES.arrowhead},
  {id:'match_80', phase:'r32',  slot:'R32-8',   homeLabel:'1H',    awayLabel:'2I',    venue:VENUES.azteca   },
  {id:'match_81', phase:'r32',  slot:'R32-9',   homeLabel:'1I',    awayLabel:'2H',    venue:VENUES.levis    },
  {id:'match_82', phase:'r32',  slot:'R32-10',  homeLabel:'1J',    awayLabel:'2G',    venue:VENUES.gillette },
  {id:'match_83', phase:'r32',  slot:'R32-11',  homeLabel:'1K',    awayLabel:'2F',    venue:VENUES.bc       },
  {id:'match_84', phase:'r32',  slot:'R32-12',  homeLabel:'1L',    awayLabel:'2E',    venue:VENUES.bmo      },
  {id:'match_85', phase:'r32',  slot:'R32-13',  homeLabel:'M3°-1', awayLabel:'M3°-2', venue:VENUES.att      },
  {id:'match_86', phase:'r32',  slot:'R32-14',  homeLabel:'M3°-3', awayLabel:'M3°-4', venue:VENUES.sofi     },
  {id:'match_87', phase:'r32',  slot:'R32-15',  homeLabel:'M3°-5', awayLabel:'M3°-6', venue:VENUES.metlife  },
  {id:'match_88', phase:'r32',  slot:'R32-16',  homeLabel:'M3°-7', awayLabel:'M3°-8', venue:VENUES.mercedes },
  // Round of 16 (8 matches)
  {id:'match_89', phase:'r16',  slot:'R16-1',   homeLabel:'W73',   awayLabel:'W74',   venue:VENUES.metlife  },
  {id:'match_90', phase:'r16',  slot:'R16-2',   homeLabel:'W75',   awayLabel:'W76',   venue:VENUES.att      },
  {id:'match_91', phase:'r16',  slot:'R16-3',   homeLabel:'W77',   awayLabel:'W78',   venue:VENUES.sofi     },
  {id:'match_92', phase:'r16',  slot:'R16-4',   homeLabel:'W79',   awayLabel:'W80',   venue:VENUES.mercedes },
  {id:'match_93', phase:'r16',  slot:'R16-5',   homeLabel:'W81',   awayLabel:'W82',   venue:VENUES.hardrock },
  {id:'match_94', phase:'r16',  slot:'R16-6',   homeLabel:'W83',   awayLabel:'W84',   venue:VENUES.lincoln  },
  {id:'match_95', phase:'r16',  slot:'R16-7',   homeLabel:'W85',   awayLabel:'W86',   venue:VENUES.arrowhead},
  {id:'match_96', phase:'r16',  slot:'R16-8',   homeLabel:'W87',   awayLabel:'W88',   venue:VENUES.azteca   },
  // Quarterfinals
  {id:'match_97', phase:'qf',   slot:'QF-1',    homeLabel:'W89',   awayLabel:'W90',   venue:VENUES.att      },
  {id:'match_98', phase:'qf',   slot:'QF-2',    homeLabel:'W91',   awayLabel:'W92',   venue:VENUES.mercedes },
  {id:'match_99', phase:'qf',   slot:'QF-3',    homeLabel:'W93',   awayLabel:'W94',   venue:VENUES.sofi     },
  {id:'match_100',phase:'qf',   slot:'QF-4',    homeLabel:'W95',   awayLabel:'W96',   venue:VENUES.metlife  },
  // Semifinals
  {id:'match_101',phase:'sf',   slot:'SF-1',    homeLabel:'W97',   awayLabel:'W98',   venue:VENUES.att      },
  {id:'match_102',phase:'sf',   slot:'SF-2',    homeLabel:'W99',   awayLabel:'W100',  venue:VENUES.mercedes },
  // Third place
  {id:'match_103',phase:'third',slot:'3° Lugar',homeLabel:'L101',  awayLabel:'L102',  venue:VENUES.azteca   },
  // Final
  {id:'match_104',phase:'final',slot:'FINAL',   homeLabel:'W101',  awayLabel:'W102',  venue:VENUES.metlife  },
];

export const FIXTURES = {
  groupStage: groupMatches,
  knockout:   knockoutMatches,
  all:        [...groupMatches, ...knockoutMatches],
};

export const PHASE_LABELS = {
  group: 'Fase de Grupos',
  r32:   'Ronda de 32',
  r16:   'Octavos de Final',
  qf:    'Cuartos de Final',
  sf:    'Semifinales',
  third: 'Tercer Lugar',
  final: 'FINAL',
};
