import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createPasswordHash, validatePassword } from '../utils/auth';
import { saveAuth, updateSetting } from '../db/database';
import { parseAmountInput } from '../utils/currency';
import { getToday } from '../utils/date';

export default function SetupScreen({ navigation, onComplete }: any) {
  const [step, setStep] = useState(0);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [opening, setOpening] = useState('');
  const [error, setError] = useState('');

  const handleNext = async () => {
    if (step === 0) {
      const err = validatePassword(password);
      if (err) { setError(err); return; }
      setError(''); setStep(1);
    } else if (step === 1) {
      if (password !== confirm) { setError('Password match nahi kar raha'); return; }
      setError(''); setStep(2);
    } else {
      try {
        const { hash, salt } = await createPasswordHash(password);
        await saveAuth(hash, salt);
        const amount = parseAmountInput(opening) || 0;
        await updateSetting('opening_balance', amount.toString());
        await updateSetting('opening_balance_date', getToday());
        await updateSetting('is_initialized', 'true');
        onComplete();
      } catch (e) {
        Alert.alert('Error', 'Setup failed. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Setup</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.progress}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.progressBar, i <= step && styles.progressBarActive]} />
          ))}
        </View>

        <Text style={styles.stepTitle}>
          {step === 0 && 'Password banayein'}
          {step === 1 && 'Confirm karein'}
          {step === 2 && 'Opening Balance'}
        </Text>
        
        <Text style={styles.stepSubtitle}>
          {step === 0 && 'Kam az kam 8 characters ka password'}
          {step === 1 && 'Password dobara enter karein'}
          {step === 2 && 'Abhi kitne paise hain? (Skip kar sakte hain)'}
        </Text>

        {step === 0 && (
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
        
        {step === 1 && (
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#777B75"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            autoFocus
          />
        )}
        
        {step === 2 && (
          <View style={styles.amountContainer}>
            <Text style={styles.currencyLabel}>Rs.</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#777B7540"
              keyboardType="decimal-pad"
              value={opening}
              onChangeText={setOpening}
              autoFocus
            />
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.buttonRow}>
          {step > 0 && (
            <TouchableOpacity style={styles.secondaryButton} onPress={() => { setStep(step - 1); setError(''); }}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.primaryButton, step > 0 && { flex: 1 }]} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>{step === 2 ? 'Finish' : 'Continue'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F3' },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E4E5DF', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#20231F' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  progress: { flexDirection: 'row', gap: 8, marginBottom: 32 },
  progressBar: { flex: 1, height: 4, backgroundColor: '#E4E5DF' },
  progressBarActive: { backgroundColor: '#376B4B' },
  stepTitle: { fontSize: 20, fontWeight: 'bold', color: '#20231F', marginBottom: 8 },
  stepSubtitle: { fontSize: 14, color: '#777B75', marginBottom: 24 },
  input: { width: '100%', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', color: '#20231F', fontSize: 16 },
  amountContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF' },
  currencyLabel: { paddingLeft: 16, fontSize: 16, fontWeight: '500', color: '#777B75' },
  amountInput: { flex: 1, paddingHorizontal: 12, paddingVertical: 16, fontSize: 24, fontWeight: 'bold', color: '#20231F' },
  error: { fontSize: 12, color: '#B84C43', marginTop: 8 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 32 },
  secondaryButton: { flex: 1, backgroundColor: '#EFEFE9', paddingVertical: 16, alignItems: 'center' },
  secondaryButtonText: { fontSize: 16, fontWeight: '600', color: '#20231F' },
  primaryButton: { flex: 1, backgroundColor: '#376B4B', paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
