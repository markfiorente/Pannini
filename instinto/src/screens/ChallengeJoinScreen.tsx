import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors } from '../theme';
import { getChallenge } from '../lib/challenges';

type Props = NativeStackScreenProps<RootStackParamList, 'ChallengeJoin'>;

export default function ChallengeJoinScreen({ navigation }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (code.trim().length < 6) return;
    setLoading(true);
    setError(null);
    const challenge = await getChallenge(code.trim());
    setLoading(false);
    if (!challenge) {
      setError('Código no encontrado. Revisá que esté bien escrito.');
      return;
    }
    if (challenge.player_b_name != null) {
      setError('Este reto ya fue aceptado. ¡Llegaste tarde!');
      return;
    }
    navigation.replace('ChallengePreview', { code: challenge.code });
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Tengo un{'\n'}Reto</Text>
          <Text style={styles.subtitle}>Ingresá el código que te mandaron</Text>

          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={code}
            onChangeText={t => { setCode(t.toUpperCase()); setError(null); }}
            placeholder="ABC123"
            placeholderTextColor={Colors.muted}
            maxLength={6}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.joinBtn, code.length < 6 && styles.joinBtnDisabled]}
            onPress={handleJoin}
            disabled={code.length < 6 || loading}
          >
            {loading
              ? <ActivityIndicator color={Colors.bg} />
              : <Text style={styles.joinBtnText}>BUSCAR RETO →</Text>
            }
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1 },
  content: { flex: 1, padding: 24 },
  back: { marginBottom: 32 },
  backText: { color: Colors.muted, fontSize: 14 },
  title: { fontSize: 48, fontWeight: '900', color: Colors.text, lineHeight: 52, marginBottom: 12 },
  subtitle: { fontSize: 16, color: Colors.muted, marginBottom: 40 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border,
    padding: 20, color: Colors.text,
    fontSize: 36, fontWeight: '900', letterSpacing: 12, textAlign: 'center',
    marginBottom: 8,
  },
  inputError: { borderColor: Colors.danger },
  error: { color: Colors.danger, fontSize: 14, textAlign: 'center', marginBottom: 8, lineHeight: 20 },
  joinBtn: {
    backgroundColor: Colors.text, borderRadius: 50,
    padding: 18, alignItems: 'center', marginTop: 16,
  },
  joinBtnDisabled: { opacity: 0.3 },
  joinBtnText: { color: Colors.bg, fontSize: 16, fontWeight: '900', letterSpacing: 2 },
});
