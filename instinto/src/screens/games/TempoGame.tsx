import React, { useCallback, useRef, useState } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, gameConfig } from '../../theme';
import { saveScore } from '../../storage/scores';

const TARGETS = [3000, 5000, 7000, 10000, 15000]; // ms
const ROUNDS = 3;
const color = gameConfig.tempo.color;

type Phase = 'intro' | 'running' | 'result';
type Props = NativeStackScreenProps<RootStackParamList, 'TempoGame'>;

function randomTarget() {
  return TARGETS[Math.floor(Math.random() * TARGETS.length)];
}

export default function TempoGame({ navigation }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [round, setRound] = useState(1);
  const [target, setTarget] = useState(randomTarget);
  const [deviations, setDeviations] = useState<number[]>([]);
  const [lastDev, setLastDev] = useState<number | null>(null);
  const startRef = useRef<number>(0);

  const handleStart = useCallback(() => {
    startRef.current = Date.now();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhase('running');
  }, []);

  const handleStop = useCallback(async () => {
    const elapsed = Date.now() - startRef.current;
    const dev = Math.abs(elapsed - target);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLastDev(dev);
    const nextDevs = [...deviations, dev];
    setDeviations(nextDevs);
    setPhase('result');

    if (round >= ROUNDS) {
      const avg = Math.round(nextDevs.reduce((a, b) => a + b, 0) / nextDevs.length);
      setTimeout(async () => {
        const isNew = await saveScore('tempo', avg);
        navigation.replace('Result', { game: 'tempo', score: avg, isNewRecord: isNew });
      }, 1800);
    }
  }, [target, deviations, round, navigation]);

  const nextRound = useCallback(() => {
    setRound(r => r + 1);
    setTarget(randomTarget());
    setPhase('intro');
    setLastDev(null);
  }, []);

  const targetSecs = (target / 1000).toFixed(0);
  const isGood = lastDev != null && lastDev < 300;

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Salir</Text>
        </Pressable>

        <View style={styles.center}>
          <Text style={styles.emoji}>⏱️</Text>

          {phase === 'intro' && (
            <>
              <Text style={styles.roundLabel}>Ronda {round} / {ROUNDS}</Text>
              <Text style={styles.target}>
                <Text style={[styles.targetNum, { color }]}>{targetSecs}</Text>
                <Text style={styles.targetUnit}> segundos</Text>
              </Text>
              <Text style={styles.hint}>
                Presioná Inicio y luego Parar cuando creás que pasaron {targetSecs}s.{'\n'}Sin mirar el reloj.
              </Text>
              <TouchableOpacity style={[styles.bigBtn, { borderColor: color }]} onPress={handleStart}>
                <Text style={[styles.bigBtnText, { color }]}>INICIO</Text>
              </TouchableOpacity>
            </>
          )}

          {phase === 'running' && (
            <>
              <Text style={styles.running}>Corriendo...</Text>
              <Text style={styles.hint}>Toca cuando creás que pasaron {targetSecs}s</Text>
              <TouchableOpacity style={[styles.bigBtn, { borderColor: color, backgroundColor: color + '22' }]} onPress={handleStop}>
                <Text style={[styles.bigBtnText, { color }]}>PARAR</Text>
              </TouchableOpacity>
            </>
          )}

          {phase === 'result' && lastDev != null && (
            <>
              <Text style={[styles.devLabel, { color: isGood ? Colors.success : Colors.text }]}>
                {isGood ? '🎯 Casi perfecto' : ''}
              </Text>
              <Text style={styles.devValue}>
                ±<Text style={{ color }}>{lastDev}</Text>ms
              </Text>
              <Text style={styles.hint}>de error respecto a {targetSecs}s</Text>

              {round < ROUNDS ? (
                <TouchableOpacity style={[styles.bigBtn, { borderColor: color }]} onPress={nextRound}>
                  <Text style={[styles.bigBtnText, { color }]}>SIGUIENTE →</Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.hint, { color: Colors.mutedLight, marginTop: 24 }]}>Calculando resultado...</Text>
              )}
            </>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emoji: { fontSize: 56, marginBottom: 8 },
  roundLabel: { color: Colors.muted, fontSize: 14, marginBottom: 16 },
  target: { marginBottom: 16 },
  targetNum: { fontSize: 72, fontWeight: '900' },
  targetUnit: { fontSize: 24, color: Colors.mutedLight, fontWeight: '600' },
  hint: { color: Colors.mutedLight, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  bigBtn: {
    borderWidth: 2, borderRadius: 50, paddingHorizontal: 48, paddingVertical: 16,
    marginTop: 8,
  },
  bigBtnText: { fontSize: 18, fontWeight: '800', letterSpacing: 2 },
  running: { fontSize: 22, color: Colors.text, fontWeight: '700', marginBottom: 16 },
  devLabel: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  devValue: { fontSize: 52, fontWeight: '900', color: Colors.text, marginBottom: 8 },
});
