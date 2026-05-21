import React, { useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Animated, Share,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, gameConfig, toPercentile, formatScore } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ route, navigation }: Props) {
  const { game, score, isNewRecord } = route.params;
  const cfg = gameConfig[game];
  const percentile = toPercentile(game, score);
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scoreAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }),
    ]).start();
    if (isNewRecord) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const rating = percentile >= 80 ? '🏆 Élite' : percentile >= 60 ? '⭐ Bueno' : percentile >= 40 ? '👍 Normal' : '💪 Sigue intentando';

  const handleShare = async () => {
    const emoji = cfg.emoji;
    const text = `${emoji} INSTINTO — ${cfg.label}\n\nScore: ${formatScore(game, score)}\nTop ${100 - percentile}% mundial\n\n¿Podés superarme?`;
    await Share.share({ message: text });
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          {isNewRecord && (
            <View style={styles.recordBadge}>
              <Text style={styles.recordText}>🎉 NUEVO RÉCORD</Text>
            </View>
          )}

          <Animated.View style={[styles.scoreCard, {
            transform: [{ scale: scoreAnim }],
            borderColor: cfg.color,
          }]}>
            <Text style={styles.gameEmoji}>{cfg.emoji}</Text>
            <Text style={[styles.gameName, { color: cfg.color }]}>{cfg.label.toUpperCase()}</Text>
            <Text style={styles.scoreValue}>{formatScore(game, score)}</Text>
            <Text style={styles.ratingText}>{rating}</Text>
            <View style={styles.divider} />
            <Text style={styles.percentileText}>Top <Text style={{ color: cfg.color, fontWeight: '800' }}>{100 - percentile}%</Text> mundial</Text>
          </Animated.View>

          <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={[styles.btn, { borderColor: cfg.color }]}
              onPress={() => navigation.popToTop()}
            >
              <Text style={[styles.btnText, { color: cfg.color }]}>JUGAR DE NUEVO</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>📤 Compartir</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.profileLink}>Ver mi perfil →</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  recordBadge: {
    backgroundColor: Colors.success + '22', borderColor: Colors.success, borderWidth: 1,
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 24,
  },
  recordText: { color: Colors.success, fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  scoreCard: {
    width: '100%', maxWidth: 320, borderWidth: 2, borderRadius: 24,
    padding: 32, alignItems: 'center', backgroundColor: Colors.surface,
  },
  gameEmoji: { fontSize: 44, marginBottom: 8 },
  gameName: { fontSize: 13, fontWeight: '800', letterSpacing: 3, marginBottom: 24 },
  scoreValue: { fontSize: 56, fontWeight: '900', color: Colors.text, marginBottom: 8 },
  ratingText: { fontSize: 18, color: Colors.mutedLight, marginBottom: 20 },
  divider: { height: 1, backgroundColor: Colors.border, width: '100%', marginBottom: 20 },
  percentileText: { fontSize: 16, color: Colors.mutedLight },
  actions: { marginTop: 32, alignItems: 'center', gap: 16, width: '100%' },
  btn: {
    borderWidth: 2, borderRadius: 50, paddingHorizontal: 40, paddingVertical: 14,
    width: '100%', alignItems: 'center',
  },
  btnText: { fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  shareBtn: {
    backgroundColor: Colors.surface, borderRadius: 50,
    paddingHorizontal: 40, paddingVertical: 14,
    width: '100%', alignItems: 'center',
  },
  shareBtnText: { fontSize: 16, fontWeight: '700', color: Colors.text },
  profileLink: { color: Colors.muted, fontSize: 14, textDecorationLine: 'underline' },
});
