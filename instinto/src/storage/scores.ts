import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameType, PlayerProfile } from '../types';

const KEY = 'instinto_profile_v1';

export async function getProfile(): Promise<PlayerProfile> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { reflex: null, tempo: null, code: null };
}

export async function saveScore(game: GameType, score: number): Promise<boolean> {
  const profile = await getProfile();
  const current = profile[game];

  const isRefRecord = (game === 'reflex' || game === 'tempo')
    ? current === null || score < current
    : current === null || score > current;

  if (isRefRecord) {
    profile[game] = score;
    await AsyncStorage.setItem(KEY, JSON.stringify(profile));
  }
  return isRefRecord;
}
