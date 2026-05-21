import { ChallengeRow } from './challenges';

type Scores = { reflex: number | null; tempo: number | null; code: number | null };

let _challengeId: string | null = null;
let _playerBName: string | null = null;
let _scores: Scores = { reflex: null, tempo: null, code: null };
let _challengeData: ChallengeRow | null = null;

export function initChallenge(challengeId: string, playerBName: string, data: ChallengeRow) {
  _challengeId = challengeId;
  _playerBName = playerBName;
  _challengeData = data;
  _scores = { reflex: null, tempo: null, code: null };
}

export function recordScore(game: 'reflex' | 'tempo' | 'code', score: number) {
  _scores[game] = score;
}

export const getChallengeId = () => _challengeId;
export const getPlayerBName = () => _playerBName;
export const getScores = (): Scores => ({ ..._scores });
export const getChallengeData = () => _challengeData;

export function reset() {
  _challengeId = null;
  _playerBName = null;
  _scores = { reflex: null, tempo: null, code: null };
  _challengeData = null;
}
