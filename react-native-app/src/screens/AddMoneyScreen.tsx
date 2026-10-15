import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addTransaction, getCategoriesByType, getOrCreatePerson, addDebt } from '../db/database';
import { parseAmountInput, formatAmountDisplay } from '../utils/currency';
import { getToday } from '../utils/date';

export default function AddMoneyScreen({ navigation }: any) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('gift_allowance');
  const [date, setDate] = useState(getToday());
  const [person, setPerson] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState('');

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const cats = await getCategoriesByType('income');
    setCategories(cats);
  };

  const types = [
    { value: 'earned_income', label: 'Earned Income' },
    { value: 'gift_allowance', label: 'Gift / Allowance' },
    { value: 'family_money', label: 'Family Money' },
    { value: 'person_money', label: 'From Person' },
    { value: 'borrowed_money', label: 'Borrowed' },
    { value: 'other_income', label: 'Other' },
  ];

  const handleSave = async () => {
    const amt = parseAmountInput(amount);
    if (!amt) { setError('Please enter an amount'); return; }

    let personId: string | null = null;
    if (person.trim()) {
      personId = await getOrCreatePerson(person.trim());
    }

    let debtId: string | null = null;
    if (type === 'borrowed_money' && personId) {
      debtId = await addDebt(personId, amt, date, null, notes);
    }

    await addTransaction({
      transaction_type: type,
      amount: amt,
      currency_code: 'PKR',
      category_id: categoryId || null,
      related_person_id: personId,
      description: person.trim() || types.find(t => t.value === type)?.label || 'Money',
      notes,
      transaction_date: date,
      related_debt_id: debtId,
    });

    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Money</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.content}>
          {/* Amount */}
          <View style={styles.amountContainer}>
            <Text style={styles.currencyLabel}>Rs.</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#777B7540"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(v) => { setAmount(formatAmountDisplay(v)); setError(''); }}
              autoFocus
            />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Type */}
          <Text style={styles.label}>TYPE</Text>
          <View style={styles.chips}>
            {types.map(t => (
              <TouchableOpacity
                key={t.value}
                style={[styles.chip, type === t.value && styles.chipActive]}
                onPress={() => setType(t.value)}
              >
                <Text style={[styles.chipText, type === t.value && styles.chipTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date */}
          <Text style={styles.label}>DATE</Text>
          <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />

          {/* Person */}
          {['gift_allowance', 'family_money', 'person_money', 'borrowed_money'].includes(type) && (
            <>
              <Text style={styles.label}>RECEIVED FROM</Text>
              <TextInput style={styles.input} value={person} onChangeText={setPerson} placeholder="Name" />
            </>
          )}

          {/* Category */}
          <Text style={styles.label}>CATEGORY</Text>
          <View style={styles.chips}>
            {categories.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.chip, categoryId === c.id && styles.chipActive]}
                onPress={() => setCategoryId(c.id)}
              >
                <Text style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notes */}
          <Text style={styles.label}>NOTES</Text>
          <TextInput style={[styles.input, { height: 80 }]} value={notes} onChangeText={setNotes} placeholder="Optional" multiline />

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F3' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E4E5DF' },
  backButton: { fontSize: 28, color: '#376B4B', fontWeight: '300', marginTop: -4 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#20231F' },
  content: { padding: 20 },
  amountContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', marginBottom: 8 },
  currencyLabel: { paddingLeft: 16, fontSize: 16, fontWeight: '500', color: '#777B75' },
  amountInput: { flex: 1, paddingHorizontal: 12, paddingVertical: 16, fontSize: 24, fontWeight: 'bold', color: '#20231F' },
  error: { fontSize: 12, color: '#B84C43', marginBottom: 8 },
  label: { fontSize: 10, fontWeight: '500', color: '#777B75', letterSpacing: 1, marginTop: 20, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#E4E5DF', backgroundColor: '#FFFFFF' },
  chipActive: { backgroundColor: '#376B4B', borderColor: '#376B4B' },
  chipText: { fontSize: 12, fontWeight: '500', color: '#20231F' },
  chipTextActive: { color: '#FFFFFF' },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#20231F' },
  saveButton: { backgroundColor: '#376B4B', paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
