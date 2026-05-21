import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  SafeAreaView,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, gameConfig } from '../../theme';
import { saveScore } from '../../storage/scores';

type Phase = 'idle' | 'waiting' | 'ready' | 'tooEarly' | 'done';

const ROUNDS = 5;
const color = gameConfig.reflex.color;

type Props = NativeStackScreenProps<RootStackParamList, 'ReflexGame'>;

export default function ReflexGame({ navigation }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [lastTime, setLastTime] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef<number>(0);

  const startRound = useCallback(() => {
    setPhase('waiting');
    setLastTime(null);
    const delay = 1500 + Math.random() * 3500;
    timerRef.current = setTimeout(() => {
      startRef.current = Date.now();
      setPhase('ready');
    }, delay);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handleTap = useCallback(async () => {
    if (phase === 'idle') {
      startRound();
      return;
    }

    if (phase === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase('tooEarly');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => startRound(), 1500);
      return;
    }

    if (phase === 'ready') {
      const elapsed = Date.now() - startRef.current;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setLastTime(elapsed);
      const nextTimes = [...times, elapsed];
      setTimes(nextTimes);
      const nextRound = round + 1;
      setRound(nextRound);

      if (nextRound >= ROUNDS) {
        const avg = Math.round(nextTimes.reduce((a, b) => a + b, 0) / nextTimes.length);
        const isNew = await saveScore('reflex', avg);
        navigation.replace('Result', { game: 'reflex', score: avg, isNewRecord: isNew });
      } else {
        setPhase('done');
      }
    }

    if (phase === 'done') {
      startRound();
    }
  }, [phase, round, times, startRound, navigation]);

  const bgColor = phase === 'ready' ? color : Colors.bg;

  const title = {
    idle: 'Toca para empezar',
    waiting: 'Espera...',
    ready: '¡AHORA!',
    tooEarly: 'Demasiado rápido 😅',
    done: 'Toca para continuar',
  }[phase];

  const subtitle = {
    idle: 'Toca cuando el fondo cambie de color',
    waiting: '',
    ready: `${lastTime != null ? `${lastTime}ms` : ''}`,
    tooEarly: 'Espera el cambio de color',
    done: lastTime != null ? `${lastTime}ms — Ronda ${round}/${ROUNDS}` : '',
  }[phase];

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={[styles.screen, { backgroundColor: bgColor }]}>
        <SafeAreaView style={styles.safe}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Salir</Text>
          </Pressable>

          <View style={styles.center}>
            <Text style={styles.emoji}>⚡</Text>
            <Text style={[styles.title, phase === 'ready' && styles.titleDark]}>{title}</Text>
            {subtitle ? (
              <Text style={[styles.sub, phase === 'ready' && styles.subDark]}>{subtitle}</Text>
            ) : null}

            {round > 0 && phase !== 'ready' && (
              <View style={styles.dotsRow}>
                {Array.from({ length: ROUNDS }).map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i < round && { backgroundColor: color }]}
                  />
                ))}
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1 },
  back: { padding: 20 },
  backText: { color: Colors.muted, fontSize: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emoji: { fontSize: 64, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  titleDark: { color: Colors.bg },
  sub: { fontSize: 16, color: Colors.mutedLight, marginTop: 12, textAlign: 'center' },
  subDark: { color: Colors.bg + 'CC' },
  dotsRow: { flexDirection: 'row', gap: 10, marginTop: 40 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.border },
});
