import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, formatScore } from '../theme';
import { getProfile } from '../storage/scores';
import { createChallenge } from '../lib/challenges';

const BETS = [
  { emoji: '☕', label: 'Invita el café' },
  { emoji: '🍕', label: 'Invita la pizza' },
  { emoji: '💪', label: '20 sentadillas en vivo' },
  { emoji: '📸', label: 'Foto de perfil ridícula 24hs' },
  { emoji: '🎤', label: 'Audio cantando al grupo' },
  { emoji: '💃', label: 'Baile en stories' },
  { emoji: '😬', label: 'Le escribe al ex' },
  { emoji: '🧹', label: 'Quehaceres por un día' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'ChallengeSetup'>;

export default function ChallengeSetupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [selectedBet, setSelectedBet] = useState<string | null>(null);
  const [customBet, setCustomBet] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [scores, setScores] = useState<{ reflex: number | null; tempo: number | null; code: number | null }>({
    reflex: null, tempo: null, code: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => { getProfile().then(setScores); }, []);

  const missingGames = ([
    scores.reflex == null && 'Reflejo ⚡',
    scores.tempo == null && 'Tempo ⏱️',
    scores.code == null && 'Código 🧠',
  ] as (string | false)[]).filter(Boolean) as string[];

  const activeBet = showCustom ? customBet.trim() : selectedBet;
  const canCreate = name.trim().length > 0 && activeBet && missingGames.length === 0 && !loading;

  const handleCreate = async () => {
    if (!canCreate) return;
    setLoading(true);
    try {
      const challenge = await createChallenge(
        name.trim(), activeBet!, scores.reflex, scores.tempo, scores.code,
      );
      navigation.replace('ChallengeShare', {
        challengeId: challenge.id,
        code: challenge.code,
        playerAName: challenge.player_a_name,
        reflexScore: challenge.player_a_reflex,
        tempoScore: challenge.player_a_tempo,
        codeScore: challenge.player_a_code,
        bet: challenge.bet,
      });
    } catch {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
              <Text style={styles.backText}>← Volver</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Crear Reto</Text>

            {missingGames.length > 0 ? (
              <View style={styles.warning}>
                <Text style={styles.warningTitle}>Falta jugar primero:</Text>
                <Text style={styles.warningBody}>{missingGames.join('   ')}</Text>
              </View>
            ) : (
              <View style={styles.scoresRow}>
                <ScoreChip label="⚡" value={formatScore('reflex', scores.reflex!)} color={Colors.reflex} />
                <ScoreChip label="⏱️" value={formatScore('tempo', scores.tempo!)} color={Colors.tempo} />
                <ScoreChip label="🧠" value={formatScore('code', scores.code!)} color={Colors.code} />
              </View>
            )}

            <Text style={styles.label}>TU NOMBRE</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="¿Cómo te llaman?"
              placeholderTextColor={Colors.muted}
              maxLength={20}
            />

            <Text style={styles.label}>EL PERDEDOR...</Text>
            <View style={styles.betsGrid}>
              {BETS.map(b => {
                const betStr = `${b.emoji} ${b.label}`;
                const active = selectedBet === betStr && !showCustom;
                return (
                  <TouchableOpacity
                    key={b.label}
                    style={[styles.betChip, active && styles.betChipActive]}
                    onPress={() => { setSelectedBet(betStr); setShowCustom(false); }}
                  >
                    <Text style={[styles.betChipText, active && styles.betChipTextActive]}>
                      {b.emoji} {b.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[styles.betChip, showCustom && styles.betChipActive]}
                onPress={() => { setShowCustom(true); setSelectedBet(null); }}
              >
                <Text style={[styles.betChipText, showCustom && styles.betChipTextActive]}>
                  ✏️ Personalizar
                </Text>
              </TouchableOpacity>
            </View>

            {showCustom && (
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                value={customBet}
                onChangeText={setCustomBet}
                placeholder="El perdedor..."
                placeholderTextColor={Colors.muted}
                maxLength={60}
                autoFocus
              />
            )}

            <TouchableOpacity
              style={[styles.createBtn, !canCreate && styles.createBtnDisabled]}
              onPress={handleCreate}
              disabled={!canCreate}
            >
              {loading
                ? <ActivityIndicator color={Colors.bg} />
                : <Text style={styles.createBtnText}>⚔️ CREAR RETO</Text>
              }
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function ScoreChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.scoreChip, { borderColor: color + '60' }]}>
      <Text style={styles.scoreChipEmoji}>{label}</Text>
      <Text style={[styles.scoreChipValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  back: { marginBottom: 8 },
  backText: { color: Colors.muted, fontSize: 14 },
  title: { fontSize: 32, fontWeight: '900', color: Colors.text, letterSpacing: 2, marginBottom: 24 },
  warning: {
    backgroundColor: Colors.danger + '18', borderRadius: 14,
    padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.danger + '40',
  },
  warningTitle: { color: Colors.danger, fontWeight: '700', fontSize: 14, marginBottom: 6 },
  warningBody: { color: Colors.danger, fontSize: 15 },
  scoresRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  scoreChip: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, padding: 12, alignItems: 'center', gap: 4,
  },
  scoreChipEmoji: { fontSize: 20 },
  scoreChipValue: { fontSize: 14, fontWeight: '800' },
  label: { fontSize: 11, color: Colors.muted, letterSpacing: 3, marginBottom: 10, marginTop: 8 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    padding: 16, color: Colors.text, fontSize: 16, marginBottom: 16,
  },
  betsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  betChip: {
    backgroundColor: Colors.surface, borderRadius: 24,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  betChipActive: { borderColor: Colors.danger, backgroundColor: Colors.danger + '20' },
  betChipText: { color: Colors.mutedLight, fontSize: 13 },
  betChipTextActive: { color: Colors.danger, fontWeight: '700' },
  createBtn: {
    backgroundColor: Colors.text, borderRadius: 50,
    padding: 18, alignItems: 'center', marginTop: 24,
  },
  createBtnDisabled: { opacity: 0.3 },
  createBtnText: { color: Colors.bg, fontSize: 16, fontWeight: '900', letterSpacing: 2 },
});
