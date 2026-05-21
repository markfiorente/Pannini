import React, { useCallback, useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Pressable, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, GameType } from '../types';
import { Colors, gameConfig, toPercentile, formatScore } from '../theme';
import { getProfile } from '../storage/scores';
import { PlayerProfile } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function GameCard({
  game, score, onPress,
}: { game: GameType; score: number | null; onPress: () => void }) {
  const cfg = gameConfig[game];
  const pct = score != null ? toPercentile(game, score) : null;

  return (
    <TouchableOpacity style={[styles.card, { borderColor: cfg.color + '40' }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardEmoji}>{cfg.emoji}</Text>
        <View>
          <Text style={[styles.cardName, { color: cfg.color }]}>{cfg.label}</Text>
          <Text style={styles.cardDesc}>{cfg.description}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        {score != null ? (
          <>
            <Text style={[styles.cardScore, { color: cfg.color }]}>{formatScore(game, score)}</Text>
            <Text style={styles.cardPct}>Top {100 - pct!}%</Text>
          </>
        ) : (
          <Text style={styles.cardNew}>NUEVO</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<PlayerProfile>({ reflex: null, tempo: null, code: null });

  useFocusEffect(useCallback(() => {
    getProfile().then(setProfile);
  }, []));

  const gameScreens: Record<GameType, keyof RootStackParamList> = {
    reflex: 'ReflexGame',
    tempo: 'TempoGame',
    code: 'CodeGame',
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>INSTINTO</Text>
            <Text style={styles.subtitle}>Descubrí tus límites humanos</Text>
          </View>

          <Text style={styles.sectionLabel}>ELIGE UN MODO</Text>

          {(['reflex', 'tempo', 'code'] as GameType[]).map(game => (
            <GameCard
              key={game}
              game={game}
              score={profile[game]}
              onPress={() => navigation.navigate(gameScreens[game] as any)}
            />
          ))}

          <Pressable style={styles.profileBtn} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.profileBtnText}>🧠 Mi perfil de Instinto</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1 },
  content: { padding: 24, paddingBottom: 40 },
  header: { marginBottom: 40, marginTop: 16 },
  title: {
    fontSize: 40, fontWeight: '900', color: Colors.text,
    letterSpacing: 6, marginBottom: 6,
  },
  subtitle: { fontSize: 16, color: Colors.muted },
  sectionLabel: { fontSize: 11, color: Colors.muted, letterSpacing: 3, marginBottom: 16 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 18, borderWidth: 1,
    padding: 20, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  cardEmoji: { fontSize: 32 },
  cardName: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  cardDesc: { fontSize: 13, color: Colors.mutedLight },
  cardRight: { alignItems: 'flex-end' },
  cardScore: { fontSize: 18, fontWeight: '800' },
  cardPct: { fontSize: 12, color: Colors.muted },
  cardNew: {
    fontSize: 11, fontWeight: '800', color: Colors.muted,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, letterSpacing: 1,
  },
  profileBtn: {
    marginTop: 24, backgroundColor: Colors.surface, borderRadius: 50,
    padding: 16, alignItems: 'center',
  },
  profileBtnText: { color: Colors.text, fontSize: 15, fontWeight: '700' },
});
