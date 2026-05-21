export type GameType = 'reflex' | 'tempo' | 'code';

export interface PlayerProfile {
  reflex: number | null;
  tempo: number | null;
  code: number | null;
}

export type RootStackParamList = {
  Home: undefined;
  ReflexGame: { challengeMode?: boolean } | undefined;
  TempoGame: { challengeMode?: boolean } | undefined;
  CodeGame: { challengeMode?: boolean } | undefined;
  Result: { game: GameType; score: number; isNewRecord: boolean };
  Profile: undefined;
  ChallengeSetup: undefined;
  ChallengeShare: {
    challengeId: string;
    code: string;
    playerAName: string;
    reflexScore: number | null;
    tempoScore: number | null;
    codeScore: number | null;
    bet: string;
  };
  ChallengeJoin: undefined;
  ChallengePreview: { code: string };
  ChallengeResult: { challengeId: string };
};
