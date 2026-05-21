export const Colors = {
  bg: '#050505',
  surface: '#111111',
  surfaceHigh: '#1a1a1a',
  border: '#222222',
  text: '#FFFFFF',
  muted: '#555555',
  mutedLight: '#888888',

  reflex: '#FFB800',
  tempo: '#00E5FF',
  code: '#D500F9',

  success: '#00E676',
  danger: '#FF1744',
};

export const gameConfig = {
  reflex: {
    label: 'Reflejo',
    emoji: '⚡',
    color: Colors.reflex,
    description: 'Velocidad de reacción',
    unit: 'ms',
    betterLower: true,
  },
  tempo: {
    label: 'Tempo',
    emoji: '⏱️',
    color: Colors.tempo,
    description: 'Percepción del tiempo',
    unit: 'ms error',
    betterLower: true,
  },
  code: {
    label: 'Código',
    emoji: '🧠',
    color: Colors.code,
    description: 'Memoria secuencial',
    unit: 'seq',
    betterLower: false,
  },
} as const;

// Convert raw score to 0-100 percentile estimate
export function toPercentile(game: keyof typeof gameConfig, score: number): number {
  if (game === 'reflex') {
    // ~250ms avg, ~150ms elite, ~500ms slow
    return Math.round(Math.max(0, Math.min(100, ((500 - score) / 3.5))));
  }
  if (game === 'tempo') {
    // deviation in ms: 0ms = 100, 2000ms = 0
    return Math.round(Math.max(0, Math.min(100, 100 - score / 20)));
  }
  // code: sequence length. avg ~5, max realistic ~12
  return Math.round(Math.max(0, Math.min(100, (score / 12) * 100)));
}

export function formatScore(game: keyof typeof gameConfig, score: number): string {
  if (game === 'reflex') return `${score}ms`;
  if (game === 'tempo') return `±${score}ms`;
  return `×${score}`;
}
