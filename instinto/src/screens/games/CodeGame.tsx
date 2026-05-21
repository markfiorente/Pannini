import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, gameConfig } from '../../theme';
import { saveScore } from '../../storage/scores';

const color = gameConfig.code.color;
const BUTTON_COLORS = ['#FF1744', '#00E676', '#00B0FF', '#FFD600'];
const BUTTON_LABELS = ['▲', '■', '●', '◆'];
const SHOW_DELAY = 600; // ms each button lights up

type Phase = 'intro' | 'showing' | 'input' | 'wrong' | 'correct';
type Props = NativeStackScreenProps<RootStackParamList, 'CodeGame'>;

function randSeq(len: number): number[] {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 4));
}

export default function CodeGame({ navigation }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [sequence, setSequence] = useState<number[]>(randSeq(2));
  const [level, setLevel] = useState(1);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSequence = useCallback((seq: number[]) => {
    setPhase('showing');
    setInputIndex(0);
    let i = 0;
    const step = () => {
      if (i < seq.length) {
        setHighlight(seq[i]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        timerRef.current = setTimeout(() => {
          setHighlight(null);
          timerRef.current = setTimeout(() => {
            i++;
            step();
          }, 200);
        }, SHOW_DELAY);
      } else {
        setPhase('input');
      }
    };
    timerRef.current = setTimeout(step, 500);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleStart = useCallback(() => {
    showSequence(sequence);
  }, [sequence, showSequence]);

  const handleButtonPress = useCallback(async (idx: number) => {
    if (phase !== 'input') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setHighlight(idx);
    setTimeout(() => setHighlight(null), 150);

    if (idx !== sequence[inputIndex]) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPhase('wrong');
      const finalScore = level - 1 + sequence.length - 2;
      setTimeout(async () => {
        const isNew = await saveScore('code', finalScore);
        navigation.replace('Result', { game: 'code', score: finalScore, isNewRecord: isNew });
      }, 1500);
      return;
    }

    const nextIndex = inputIndex + 1;
    if (nextIndex >= sequence.length) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPhase('correct');
      const nextSeq = [...sequence, randSeq(1)[0]];
      setLevel(l => l + 1);
      setSequence(nextSeq);
      setTimeout(() => showSequence(nextSeq), 1000);
    } else {
      setInputIndex(nextIndex);
    }
  }, [phase, sequence, inputIndex, level, showSequence, navigation]);

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Salir</Text>
        </Pressable>

        <View style={styles.center}>
          <Text style={styles.emoji}>🧠</Text>

          {phase === 'intro' && (
            <>
              <Text style={styles.title}>Memoriza la secuencia</Text>
              <Text style={styles.hint}>
                Observa los botones que se iluminan{'\n'}y repite el orden exacto.
              </Text>
              <TouchableOpacity style={[styles.startBtn, { borderColor: color }]} onPress={handleStart}>
                <Text style={[styles.startBtnText, { color }]}>EMPEZAR</Text>
              </TouchableOpacity>
            </>
          )}

          {phase === 'showing' && (
            <Text style={styles.phaseLabel}>Observa...</Text>
          )}

          {phase === 'input' && (
            <Text style={styles.phaseLabel}>Tu turno — {inputIndex + 1} / {sequence.length}</Text>
          )}

          {phase === 'correct' && (
            <Text style={[styles.phaseLabel, { color: Colors.success }]}>✓ ¡Correcto!</Text>
          )}

          {phase === 'wrong' && (
            <Text style={[styles.phaseLabel, { color: Colors.danger }]}>✗ Incorrecto</Text>
          )}

          <View style={styles.grid}>
            {BUTTON_COLORS.map((btnColor, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.gameBtn,
                  { borderColor: btnColor },
                  highlight === i && { backgroundColor: btnColor },
                ]}
                onPress={() => handleButtonPress(i)}
                activeOpacity={0.7}
              >
                <Text style={[styles.gameBtnIcon, highlight === i && { color: Colors.bg }]}>
                  {BUTTON_LABELS[i]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {phase !== 'intro' && (
            <Text style={styles.levelLabel}>Nivel {level}</Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1 },
  back: { padding: 20 },
  backText: { color: Colors.muted, fontSize: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emoji: { fontSize: 52, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 12 },
  hint: { color: Colors.mutedLight, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  phaseLabel: { fontSize: 20, fontWeight: '700', color: Colors.text, marginBottom: 32 },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 16,
    width: 220, justifyContent: 'center', marginVertical: 16,
  },
  gameBtn: {
    width: 96, height: 96, borderRadius: 16, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  gameBtnIcon: { fontSize: 32, color: Colors.text },
  startBtn: {
    borderWidth: 2, borderRadius: 50, paddingHorizontal: 48, paddingVertical: 16,
  },
  startBtnText: { fontSize: 18, fontWeight: '800', letterSpacing: 2 },
  levelLabel: { color: Colors.muted, fontSize: 14, marginTop: 20 },
});
