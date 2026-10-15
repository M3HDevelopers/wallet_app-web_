import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { verifyPassword } from '../utils/auth';
import { getAuth, getSettings } from '../db/database';

export default function LockScreen({ navigation, onUnlock }: any) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [usePin, setUsePin] = useState(false);
  const [pin, setPin] = useState('');

  const handleUnlock = async () => {
    const auth = await getAuth();
    const settings = await getSettings();

    if (usePin && settings.pin_enabled === 'true') {
      if (pin === settings.pin) {
        onUnlock();
      } else {
        setError('Galat PIN');
        setPin('');
      }
      return;
    }

    const valid = await verifyPassword(password, auth.password_hash, auth.salt);
    if (valid) {
      onUnlock();
    } else {
      setError('Galat password');
      setPassword('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>🔒</Text>
        </View>
        <Text style={styles.title}>Wallet Locked</Text>
        <Text style={styles.subtitle}>
          {usePin ? 'PIN enter karein' : 'Password enter karein'}
        </Text>

        {usePin ? (
          <TextInput
            style={styles.input}
            placeholder="PIN"
            placeholderTextColor="#777B75"
            secureTextEntry
            keyboardType="numeric"
            maxLength={6}
            value={pin}
            onChangeText={setPin}
            autoFocus
          />
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#777B75"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoFocus
          />
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleUnlock} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Unlock</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setUsePin(!usePin); setError(''); setPassword(''); setPin(''); }}>
          <Text style={styles.switchText}>
            {usePin ? 'Password use karein' : 'PIN use karein'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F3' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  iconContainer: { width: 64, height: 64, backgroundColor: '#376B4B', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  iconText: { fontSize: 28 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#20231F', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#777B75', marginBottom: 32, textAlign: 'center' },
  input: { width: '100%', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', color: '#20231F', fontSize: 16, marginBottom: 8 },
  error: { fontSize: 12, color: '#B84C43', marginTop: 8, marginBottom: 8 },
  button: { width: '100%', backgroundColor: '#376B4B', paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  switchText: { fontSize: 14, color: '#376B4B', marginTop: 16, textAlign: 'center' },
});
