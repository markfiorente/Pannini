import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, formatScore } from '../theme';
import { getChallenge, ChallengeRow } from '../lib/challenges';
import { initChallenge } from '../lib/challengeState';

type Props = NativeStackScreenProps<RootStackParamList, 'ChallengePreview'>;

export default function ChallengePreviewScreen({ route, navigation }: Props) {
  const { code } = route.params;
  const [challenge, setChallenge] = useState<ChallengeRow | null>(null);
  const [name, setName] = useState('');

  useEffect(() => { getChallenge(code).then(setChallenge); }, [code]);

  const handleAccept = () => {
    if (!challenge || !name.trim()) return;
    initChallenge(challenge.id, name.trim(), challenge);
    navigation.replace('ReflexGame', { challengeMode: true });
  };

  if (!challenge) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={Colors.text} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <Text style={styles.label}>RETO RECIBIDO ⚔️</Text>
          <Text style={styles.challenger}>{challenge.player_a_name}</Text>
          <Text style={styles.vs}>te está retando</Text>

          <View style={styles.card}>
            <View style={styles.scoresSection}>
              <ScoreRow emoji="⚡" game="reflex" score={challenge.player_a_reflex} color={Colors.reflex} />
              <ScoreRow emoji="⏱️" game="tempo" score={challenge.player_a_tempo} color={Colors.tempo} />
              <ScoreRow emoji="🧠" game="code" score={challenge.player_a_code} color={Colors.code} />
            </View>
            <View style={styles.betSection}>
              <Text style={styles.betBadge}>💀 SI PERDÉS</Text>
              <Text style={styles.betValue}>{challenge.bet}</Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>¿CÓMO TE LLAMÁS?</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
            placeholderTextColor={Colors.muted}
            maxLength={20}
          />

          <TouchableOpacity
            style={[styles.acceptBtn, !name.trim() && styles.acceptBtnDisabled]}
            onPress={handleAccept}
            disabled={!name.trim()}
          >
            <Text style={styles.acceptBtnText}>ACEPTAR EL RETO</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function ScoreRow({
  emoji, game, score, color,
}: { emoji: string; game: 'reflex' | 'tempo' | 'code'; score: number | null; color: string }) {
  return (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreEmoji}>{emoji}</Text>
      <Text style={[styles.scoreValue, { color }]}>
        {score != null ? formatScore(game, score) : '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1 },
  content: { flex: 1, padding: 24 },
  label: { fontSize: 11, color: Colors.muted, letterSpacing: 3, marginTop: 20, marginBottom: 8 },
  challenger: { fontSize: 40, fontWeight: '900', color: Colors.text, marginBottom: 4 },
  vs: { fontSize: 16, color: Colors.mutedLight, marginBottom: 24 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 24, overflow: 'hidden',
  },
  scoresSection: { padding: 20, gap: 14 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  scoreEmoji: { fontSize: 22, width: 30 },
  scoreValue: { fontSize: 22, fontWeight: '900' },
  betSection: { borderTopWidth: 1, borderTopColor: Colors.border, padding: 16, gap: 4 },
  betBadge: { color: Colors.muted, fontSize: 11, letterSpacing: 2 },
  betValue: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  inputLabel: { fontSize: 11, color: Colors.muted, letterSpacing: 3, marginBottom: 10 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    padding: 16, color: Colors.text, fontSize: 16, marginBottom: 20,
  },
  acceptBtn: {
    backgroundColor: Colors.text, borderRadius: 50, padding: 18, alignItems: 'center',
  },
  acceptBtnDisabled: { opacity: 0.3 },
  acceptBtnText: { color: Colors.bg, fontSize: 16, fontWeight: '900', letterSpacing: 2 },
});
