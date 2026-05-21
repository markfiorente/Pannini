import { supabase } from './supabase';

export type ChallengeRow = {
  id: string;
  code: string;
  player_a_name: string;
  player_a_reflex: number | null;
  player_a_tempo: number | null;
  player_a_code: number | null;
  bet: string;
  player_b_name: string | null;
  player_b_reflex: number | null;
  player_b_tempo: number | null;
  player_b_code: number | null;
  winner: string | null;
  created_at: string;
};

function randomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function createChallenge(
  playerAName: string,
  bet: string,
  reflexScore: number | null,
  tempoScore: number | null,
  codeScore: number | null,
): Promise<ChallengeRow> {
  for (let i = 0; i < 5; i++) {
    const { data, error } = await supabase
      .from('challenges')
      .insert({
        code: randomCode(),
        player_a_name: playerAName,
        player_a_reflex: reflexScore,
        player_a_tempo: tempoScore,
        player_a_code: codeScore,
        bet,
      })
      .select()
      .single();

    if (!error && data) return data;
    if (error?.code !== '23505') throw error;
  }
  throw new Error('No se pudo generar un código único');
}

export async function getChallenge(code: string): Promise<ChallengeRow | null> {
  const { data } = await supabase
    .from('challenges')
    .select()
    .eq('code', code.toUpperCase().trim())
    .single();
  return data ?? null;
}

export async function submitChallengeResult(
  challengeId: string,
  challenge: ChallengeRow,
  playerBName: string,
  bReflex: number | null,
  bTempo: number | null,
  bCode: number | null,
): Promise<ChallengeRow> {
  const winner = determineWinner(challenge, playerBName, bReflex, bTempo, bCode);

  const { data, error } = await supabase
    .from('challenges')
    .update({
      player_b_name: playerBName,
      player_b_reflex: bReflex,
      player_b_tempo: bTempo,
      player_b_code: bCode,
      winner,
    })
    .eq('id', challengeId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

function determineWinner(
  c: ChallengeRow,
  bName: string,
  bReflex: number | null,
  bTempo: number | null,
  bCode: number | null,
): string {
  let scoreA = 0, scoreB = 0;

  if (c.player_a_reflex != null && bReflex != null) {
    if (c.player_a_reflex < bReflex) scoreA++;
    else if (bReflex < c.player_a_reflex) scoreB++;
  }
  if (c.player_a_tempo != null && bTempo != null) {
    if (c.player_a_tempo < bTempo) scoreA++;
    else if (bTempo < c.player_a_tempo) scoreB++;
  }
  if (c.player_a_code != null && bCode != null) {
    if (c.player_a_code > bCode) scoreA++;
    else if (bCode > c.player_a_code) scoreB++;
  }

  if (scoreA > scoreB) return c.player_a_name;
  if (scoreB > scoreA) return bName;
  return 'Empate';
}
