export type GameType = 'reflex' | 'tempo' | 'code';

export interface PlayerProfile {
  reflex: number | null;
  tempo: number | null;
  code: number | null;
}

export type RootStackParamList = {
  Home: undefined;
  ReflexGame: undefined;
  TempoGame: undefined;
  CodeGame: undefined;
  Result: {
    game: GameType;
    score: number;
    isNewRecord: boolean;
  };
  Profile: undefined;
};
