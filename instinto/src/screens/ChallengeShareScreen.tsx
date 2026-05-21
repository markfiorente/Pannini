import React, { useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Share, ScrollView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, formatScore } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ChallengeShare'>;

export default function ChallengeShareScreen({ route, navigation }: Props) {
  const { code, playerAName, reflexScore, tempoScore, codeScore, bet } = route.params;
  const [copied, setCopied] = useState(false);

  const shareText =
    `⚔️ *${playerAName} te reta en INSTINTO*\n\n` +
    `🔑 Código: *${code}*\n\n` +
    `Sus scores:\n` +
    `⚡ Reflejo: ${reflexScore != null ? formatScore('reflex', reflexScore) : '?'}\n` +
    `⏱️ Tempo: ${tempoScore != null ? formatScore('tempo', tempoScore) : '?'}\n` +
    `🧠 Código: ${codeScore != null ? formatScore('code', codeScore) : '?'}\n\n` +
    `💀 Si perdés: ${bet}\n\n` +
    `¿Te animás? Descargá INSTINTO y usá el código 👆`;

  const handleShare = useCallback(() => {
    Share.share({ message: shareText });
  }, [shareText]);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>TU CÓDIGO DE RETO</Text>
          <Text style={styles.code}>{code}</Text>
          <Text style={styles.hint}>
            Compartí este código con tu rival.{'\n'}Caduca en 7 días.
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardBadge}>⚔️ INSTINTO CHALLENGE</Text>
            <Text style={styles.cardName}>{playerAName}</Text>

            <View style={styles.cardScores}>
              <ScoreRow emoji="⚡" game="reflex" score={reflexScore} color={Colors.reflex} />
              <ScoreRow emoji="⏱️" game="tempo" score={tempoScore} color={Colors.tempo} />
              <ScoreRow emoji="🧠" game="code" score={codeScore} color={Colors.code} />
            </View>

            <View style={styles.betRow}>
              <Text style={styles.betLabel}>💀 SI PERDÉS</Text>
              <Text style={styles.betValue}>{bet}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>Compartir reto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
            <Text style={styles.copyBtnText}>{copied ? '✓ Copiado' : 'Copiar código'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.homeLink}>
            <Text style={styles.homeLinkText}>Volver al inicio</Text>
          </TouchableOpacity>
        </ScrollView>
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
  content: { padding: 24, paddingBottom: 40, alignItems: 'center' },
  label: { fontSize: 11, color: Colors.muted, letterSpacing: 3, marginTop: 20, marginBottom: 12 },
  code: { fontSize: 52, fontWeight: '900', color: Colors.text, letterSpacing: 14, marginBottom: 8 },
  hint: { color: Colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 28 },
  card: {
    width: '100%', backgroundColor: Colors.surface,
    borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 20,
  },
  cardBadge: { fontSize: 11, fontWeight: '800', color: Colors.muted, letterSpacing: 2, marginBottom: 6 },
  cardName: { fontSize: 26, fontWeight: '900', color: Colors.text, marginBottom: 18 },
  cardScores: { gap: 10, marginBottom: 18 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scoreEmoji: { fontSize: 20, width: 28 },
  scoreValue: { fontSize: 18, fontWeight: '800' },
  betRow: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 14, gap: 4 },
  betLabel: { color: Colors.muted, fontSize: 11, letterSpacing: 2 },
  betValue: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  shareBtn: {
    width: '100%', backgroundColor: Colors.text, borderRadius: 50,
    padding: 18, alignItems: 'center', marginBottom: 10,
  },
  shareBtnText: { color: Colors.bg, fontSize: 16, fontWeight: '900' },
  copyBtn: {
    width: '100%', backgroundColor: Colors.surface, borderRadius: 50,
    padding: 18, alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: Colors.border,
  },
  copyBtnText: { color: Colors.text, fontSize: 16, fontWeight: '700' },
  homeLink: { padding: 8 },
  homeLinkText: { color: Colors.muted, fontSize: 14, textDecorationLine: 'underline' },
});
