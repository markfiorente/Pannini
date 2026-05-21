import React, { useCallback, useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, Pressable, Share, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, GameType } from '../types';
import { Colors, gameConfig, toPercentile, formatScore } from '../theme';
import { getProfile } from '../storage/scores';
import { PlayerProfile } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

function ScoreBar({ game, score }: { game: GameType; score: number | null }) {
  const cfg = gameConfig[game];
  const pct = score != null ? toPercentile(game, score) : 0;

  return (
    <View style={barStyles.row}>
      <Text style={barStyles.emoji}>{cfg.emoji}</Text>
      <View style={barStyles.info}>
        <View style={barStyles.labelRow}>
          <Text style={barStyles.label}>{cfg.label}</Text>
          <Text style={[barStyles.value, { color: cfg.color }]}>
            {score != null ? formatScore(game, score) : '—'}
          </Text>
        </View>
        <View style={barStyles.track}>
          <View style={[barStyles.fill, { width: `${pct}%` as any, backgroundColor: cfg.color }]} />
        </View>
        <Text style={barStyles.pct}>{score != null ? `Top ${100 - pct}%` : 'Sin datos'}</Text>
      </View>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  emoji: { fontSize: 32, width: 48 },
  info: { flex: 1 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  value: { fontSize: 16, fontWeight: '800' },
  track: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  pct: { color: Colors.muted, fontSize: 12, marginTop: 4 },
});

export default function ProfileScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<PlayerProfile>({ reflex: null, tempo: null, code: null });

  useFocusEffect(useCallback(() => {
    getProfile().then(setProfile);
  }, []));

  const games: GameType[] = ['reflex', 'tempo', 'code'];
  const scores = games.map(g => profile[g]);
  const validScores = games.filter(g => profile[g] !== null);
  const instintoScore = validScores.length > 0
    ? Math.round(validScores.reduce((sum, g) => sum + toPercentile(g, profile[g]!), 0) / validScores.length)
    : null;

  const handleShare = async () => {
    if (!instintoScore) return;
    const lines = games.map(g => {
      const s = profile[g];
      if (s == null) return `${gameConfig[g].emoji} ${gameConfig[g].label}: sin datos`;
      return `${gameConfig[g].emoji} ${gameConfig[g].label}: ${formatScore(g, s)} (Top ${100 - toPercentile(g, s)}%)`;
    });
    const text = `🧠 Mi perfil INSTINTO\n\n${lines.join('\n')}\n\nScore total: ${instintoScore}/100\n\n¿Podés superarme?`;
    await Share.share({ message: text });
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>MI INSTINTO</Text>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>INSTINTO SCORE</Text>
            {instintoScore != null ? (
              <>
                <Text style={styles.bigScore}>{instintoScore}</Text>
                <Text style={styles.bigScoreSub}>/ 100</Text>
              </>
            ) : (
              <Text style={styles.noData}>Jugá los 3 modos para ver tu score total</Text>
            )}
          </View>

          <View style={styles.section}>
            {games.map(g => (
              <ScoreBar key={g} game={g} score={profile[g]} />
            ))}
          </View>

          {instintoScore != null && (
            <Pressable style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>📤 Compartir mi perfil</Text>
            </Pressable>
          )}

          <Text style={styles.hint}>Las marcas se actualizan automáticamente cuando mejorás tu record.</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1 },
  back: { padding: 20 },
  backText: { color: Colors.muted, fontSize: 14 },
  content: { padding: 24, paddingTop: 0 },
  title: { fontSize: 28, fontWeight: '900', color: Colors.text, letterSpacing: 4, marginBottom: 24 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 32,
    alignItems: 'center', marginBottom: 32, borderWidth: 1, borderColor: Colors.border,
  },
  cardLabel: { color: Colors.muted, fontSize: 12, letterSpacing: 3, marginBottom: 8 },
  bigScore: { fontSize: 80, fontWeight: '900', color: Colors.text, lineHeight: 88 },
  bigScoreSub: { fontSize: 20, color: Colors.muted },
  noData: { color: Colors.mutedLight, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  section: { marginBottom: 24 },
  shareBtn: {
    backgroundColor: Colors.surface, borderRadius: 50, padding: 16,
    alignItems: 'center', marginBottom: 20,
  },
  shareBtnText: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  hint: { color: Colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
