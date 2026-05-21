import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  Share, ScrollView, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, formatScore } from '../theme';
import { ChallengeRow } from '../lib/challenges';
import { supabase } from '../lib/supabase';

type Props = NativeStackScreenProps<RootStackParamList, 'ChallengeResult'>;

export default function ChallengeResultScreen({ route, navigation }: Props) {
  const { challengeId } = route.params;
  const [challenge, setChallenge] = useState<ChallengeRow | null>(null);

  useEffect(() => {
    supabase
      .from('challenges')
      .select()
      .eq('id', challengeId)
      .single()
      .then(({ data }) => setChallenge(data));
  }, [challengeId]);

  const handleShare = useCallback(() => {
    if (!challenge) return;
    const aName = challenge.player_a_name;
    const bName = challenge.player_b_name ?? 'Rival';
    const winner = challenge.winner ?? '?';
    const loser = winner === aName ? bName : winner === bName ? aName : null;

    const msg =
      `⚔️ INSTINTO CHALLENGE\n\n` +
      `${aName} VS ${bName}\n\n` +
      `⚡ ${challenge.player_a_reflex != null ? formatScore('reflex', challenge.player_a_reflex) : '?'} vs ${challenge.player_b_reflex != null ? formatScore('reflex', challenge.player_b_reflex) : '?'}\n` +
      `⏱️ ${challenge.player_a_tempo != null ? formatScore('tempo', challenge.player_a_tempo) : '?'} vs ${challenge.player_b_tempo != null ? formatScore('tempo', challenge.player_b_tempo) : '?'}\n` +
      `🧠 ${challenge.player_a_code != null ? formatScore('code', challenge.player_a_code) : '?'} vs ${challenge.player_b_code != null ? formatScore('code', challenge.player_b_code) : '?'}\n\n` +
      (winner === 'Empate'
        ? `🤝 EMPATE TOTAL\n\n`
        : `🏆 Gana: ${winner}\n💀 ${loser}: ${challenge.bet}\n\n`) +
      `¿Podés ganarles? Descargá INSTINTO`;

    Share.share({ message: msg });
  }, [challenge]);

  if (!challenge) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={Colors.text} size="large" />
      </View>
    );
  }

  const aName = challenge.player_a_name;
  const bName = challenge.player_b_name ?? 'Rival';
  const winner = challenge.winner;
  const isTie = winner === 'Empate';

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.banner}>
            <Text style={styles.bannerEmoji}>{isTie ? '🤝' : '🏆'}</Text>
            <Text style={styles.bannerTitle}>{isTie ? 'EMPATE' : `${winner} gana`}</Text>
            {!isTie && (
              <Text style={styles.bannerBet}>
                💀 {winner === aName ? bName : aName}: {challenge.bet}
              </Text>
            )}
          </View>

          <View style={styles.scoreboard}>
            <View style={styles.sbHeader}>
              <Text style={[styles.sbName, winner === aName && styles.sbNameWinner]} numberOfLines={1}>
                {aName}
              </Text>
              <Text style={styles.sbVs}>VS</Text>
              <Text style={[styles.sbName, styles.sbNameRight, winner === bName && styles.sbNameWinner]} numberOfLines={1}>
                {bName}
              </Text>
            </View>

            <GameRow
              emoji="⚡" game="reflex" color={Colors.reflex}
              scoreA={challenge.player_a_reflex} scoreB={challenge.player_b_reflex}
            />
            <GameRow
              emoji="⏱️" game="tempo" color={Colors.tempo}
              scoreA={challenge.player_a_tempo} scoreB={challenge.player_b_tempo}
            />
            <GameRow
              emoji="🧠" game="code" color={Colors.code}
              scoreA={challenge.player_a_code} scoreB={challenge.player_b_code}
            />
          </View>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>Compartir resultado</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.homeBtnText}>Volver al inicio</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function GameRow({
  emoji, game, color, scoreA, scoreB,
}: {
  emoji: string;
  game: 'reflex' | 'tempo' | 'code';
  color: string;
  scoreA: number | null;
  scoreB: number | null;
}) {
  let aWins = false, bWins = false;
  if (scoreA != null && scoreB != null) {
    if (game === 'code') { aWins = scoreA > scoreB; bWins = scoreB > scoreA; }
    else { aWins = scoreA < scoreB; bWins = scoreB < scoreA; }
  }

  return (
    <View style={styles.gameRow}>
      <Text style={[styles.gameScore, aWins && { color }]}>
        {scoreA != null ? formatScore(game, scoreA) : '—'}
      </Text>
      <Text style={[styles.gameEmoji, { color }]}>{emoji}</Text>
      <Text style={[styles.gameScore, styles.gameScoreRight, bWins && { color }]}>
        {scoreB != null ? formatScore(game, scoreB) : '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1 },
  content: { padding: 24, paddingBottom: 40 },
  banner: { alignItems: 'center', paddingVertical: 32 },
  bannerEmoji: { fontSize: 60, marginBottom: 8 },
  bannerTitle: { fontSize: 32, fontWeight: '900', color: Colors.text, marginBottom: 8 },
  bannerBet: { fontSize: 15, color: Colors.muted, textAlign: 'center' },
  scoreboard: {
    backgroundColor: Colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
    padding: 20, marginBottom: 20,
  },
  sbHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  sbName: { flex: 1, fontSize: 16, fontWeight: '800', color: Colors.muted },
  sbNameRight: { textAlign: 'right' },
  sbNameWinner: { color: Colors.text },
  sbVs: { fontSize: 11, color: Colors.muted, letterSpacing: 2 },
  gameRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  gameScore: { flex: 1, fontSize: 18, fontWeight: '800', color: Colors.muted },
  gameScoreRight: { textAlign: 'right' },
  gameEmoji: { fontSize: 20, width: 36, textAlign: 'center' },
  shareBtn: {
    backgroundColor: Colors.text, borderRadius: 50,
    padding: 18, alignItems: 'center', marginBottom: 10,
  },
  shareBtnText: { color: Colors.bg, fontSize: 16, fontWeight: '900' },
  homeBtn: {
    backgroundColor: Colors.surface, borderRadius: 50,
    padding: 18, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  homeBtnText: { color: Colors.text, fontSize: 16, fontWeight: '700' },
});
