import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addTransaction, getCategoriesByType, getOrCreatePerson, getDebtRemaining, addDebtRepayment, getDebtById, getPeople, getTransactionById, updateTransaction, deleteTransaction } from '../db/database';
import { parseAmountInput, formatAmountDisplay, formatCurrency } from '../utils/currency';
import { getToday, formatDate } from '../utils/date';
import { Alert } from 'react-native';

// ============ ADD EXPENSE ============
export function AddExpenseScreen({ navigation }: any) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getToday());
  const [person, setPerson] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState('');

  React.useEffect(() => { loadCategories(); }, []);
  const loadCategories = async () => { setCategories(await getCategoriesByType('expense')); };

  const handleSave = async () => {
    const amt = parseAmountInput(amount);
    if (!amt) { setError('Amount enter karein'); return; }
    if (!categoryId) { setError('Category select karein'); return; }
    let personId: string | null = null;
    if (person.trim()) personId = await getOrCreatePerson(person.trim());
    const cat = categories.find(c => c.id === categoryId);
    await addTransaction({
      transaction_type: 'expense', amount: amt, currency_code: 'PKR',
      category_id: categoryId, related_person_id: personId,
      description: person.trim() || cat?.name || 'Expense',
      notes, transaction_date: date, related_debt_id: null,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backButton}>‹</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.content}>
          <View style={styles.amountContainer}>
            <Text style={styles.currencyLabel}>Rs.</Text>
            <TextInput style={styles.amountInput} placeholder="0.00" placeholderTextColor="#777B7540" keyboardType="decimal-pad" value={amount} onChangeText={(v) => { setAmount(formatAmountDisplay(v)); setError(''); }} autoFocus />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.label}>DATE</Text>
          <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
          <Text style={styles.label}>CATEGORY *</Text>
          <View style={styles.chips}>
            {categories.map(c => (
              <TouchableOpacity key={c.id} style={[styles.chip, categoryId === c.id && styles.chipActive]} onPress={() => setCategoryId(c.id)}>
                <Text style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>PAID TO</Text>
          <TextInput style={styles.input} value={person} onChangeText={setPerson} placeholder="Name (optional)" />
          <Text style={styles.label}>NOTES</Text>
          <TextInput style={[styles.input, { height: 80 }]} value={notes} onChangeText={setNotes} placeholder="Optional" multiline />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}><Text style={styles.saveButtonText}>Save Expense</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============ ADD BORROW ============
export function AddBorrowScreen({ navigation }: any) {
  const [amount, setAmount] = useState('');
  const [person, setPerson] = useState('');
  const [date, setDate] = useState(getToday());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    const amt = parseAmountInput(amount);
    if (!amt) { setError('Amount enter karein'); return; }
    if (!person.trim()) { setError('Lender ka naam likhein'); return; }
    const personId = await getOrCreatePerson(person.trim());
    const debtId = await addDebt(personId, amt, date, null, notes);
    await addTransaction({
      transaction_type: 'borrowed_money', amount: amt, currency_code: 'PKR',
      category_id: null, related_person_id: personId,
      description: `Borrowed from ${person.trim()}`,
      notes, transaction_date: date, related_debt_id: debtId,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backButton}>‹</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Record Borrowing</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.content}>
          <View style={styles.amountContainer}>
            <Text style={styles.currencyLabel}>Rs.</Text>
            <TextInput style={styles.amountInput} placeholder="0.00" placeholderTextColor="#777B7540" keyboardType="decimal-pad" value={amount} onChangeText={(v) => { setAmount(formatAmountDisplay(v)); setError(''); }} autoFocus />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.label}>LENDER</Text>
          <TextInput style={styles.input} value={person} onChangeText={setPerson} placeholder="Kis se udhaar liya?" />
          <Text style={styles.label}>DATE</Text>
          <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
          <Text style={styles.label}>NOTES</Text>
          <TextInput style={[styles.input, { height: 80 }]} value={notes} onChangeText={setNotes} placeholder="Optional" multiline />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}><Text style={styles.saveButtonText}>Save</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============ ADD REPAY ============
export function AddRepayScreen({ navigation }: any) {
  const [debts, setDebts] = useState<any[]>([]);
  const [selectedDebt, setSelectedDebt] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getToday());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => { loadDebts(); }, []);

  const loadDebts = async () => {
    const allDebts = await (await import('../db/database')).getDebts();
    setDebts(allDebts.filter((d: any) => d.status === 'open'));
  };

  const handleSave = async () => {
    const amt = parseAmountInput(amount);
    if (!amt) { setError('Amount enter karein'); return; }
    if (!selectedDebt) { setError('Debt select karein'); return; }
    const remaining = await getDebtRemaining(selectedDebt);
    if (amt > remaining) { setError(`Remaining: ${formatCurrency(remaining)}`); return; }
    const debt = await getDebtById(selectedDebt);
    const people = await getPeople();
    const person = people.find((p: any) => p.id === debt.person_id);
    await addDebtRepayment(selectedDebt, amt, date, notes);
    await addTransaction({
      transaction_type: 'repayment', amount: amt, currency_code: 'PKR',
      category_id: null, related_person_id: debt.person_id,
      description: `Repaid to ${person?.name || 'lender'}`,
      notes, transaction_date: date, related_debt_id: selectedDebt,
    });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backButton}>‹</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Record Repayment</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.content}>
          {debts.length === 0 ? (
            <View style={{ padding: 32, alignItems: 'center' }}><Text style={{ color: '#777B75' }}>Koi outstanding debt nahi</Text></View>
          ) : (
            <>
              <Text style={styles.label}>SELECT DEBT</Text>
              {debts.map(d => {
                const people = getPeople();
                return (
                  <TouchableOpacity key={d.id} style={[styles.debtCard, selectedDebt === d.id && styles.debtCardActive]} onPress={() => setSelectedDebt(d.id)}>
                    <Text style={styles.debtPerson}>{d.person_id}</Text>
                    <Text style={styles.debtAmount}>Remaining: {formatCurrency(d.original_amount)}</Text>
                  </TouchableOpacity>
                );
              })}
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <View style={styles.amountContainer}>
                <Text style={styles.currencyLabel}>Rs.</Text>
                <TextInput style={styles.amountInput} placeholder="0.00" placeholderTextColor="#777B7540" keyboardType="decimal-pad" value={amount} onChangeText={(v) => { setAmount(formatAmountDisplay(v)); setError(''); }} />
              </View>
              <Text style={styles.label}>DATE</Text>
              <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
              <Text style={styles.label}>NOTES</Text>
              <TextInput style={[styles.input, { height: 80 }]} value={notes} onChangeText={setNotes} placeholder="Optional" multiline />
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}><Text style={styles.saveButtonText}>Save</Text></TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============ TRANSACTION DETAIL ============
export function TransactionDetailScreen({ navigation, route }: any) {
  const { txId } = route.params;
  const [tx, setTx] = useState<any>(null);

  React.useEffect(() => { loadTx(); }, [txId]);
  const loadTx = async () => { setTx(await getTransactionById(txId)); };

  if (!tx) return null;

  const isOut = tx.transaction_type === 'expense' || tx.transaction_type === 'repayment';

  const handleDelete = () => {
    Alert.alert('Delete?', 'Yeh transaction permanently delete ho jayegi.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteTransaction(txId); navigation.goBack(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backButton}>‹</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.content}>
          <View style={styles.detailCard}>
            <Text style={styles.detailLabel}>{tx.transaction_type}</Text>
            <Text style={[styles.detailAmount, { color: isOut ? '#B84C43' : '#34764A' }]}>
              {isOut ? '-' : '+'}{formatCurrency(tx.amount)}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Description</Text><Text style={styles.infoValue}>{tx.description}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Date</Text><Text style={styles.infoValue}>{formatDate(tx.transaction_date)}</Text></View>
            {tx.notes ? <View style={styles.infoRow}><Text style={styles.infoLabel}>Notes</Text><Text style={styles.infoValue}>{tx.notes}</Text></View> : null}
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditTransaction', { txId })}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============ EDIT TRANSACTION ============
export function EditTransactionScreen({ navigation, route }: any) {
  const { txId } = route.params;
  const [tx, setTx] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    (async () => {
      const t = await getTransactionById(txId);
      if (t) {
        setTx(t);
        setAmount((t.amount / 100).toFixed(2));
        setDate(t.transaction_date);
        setDescription(t.description);
        setNotes(t.notes);
      }
    })();
  }, [txId]);

  const handleSave = async () => {
    const amt = parseAmountInput(amount);
    if (!amt) { setError('Amount enter karein'); return; }
    await updateTransaction(txId, { amount: amt, transaction_date: date, description, notes });
    navigation.goBack();
  };

  if (!tx) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backButton}>‹</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Edit</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.content}>
          <View style={styles.amountContainer}>
            <Text style={styles.currencyLabel}>Rs.</Text>
            <TextInput style={styles.amountInput} placeholder="0.00" keyboardType="decimal-pad" value={amount} onChangeText={(v) => { setAmount(formatAmountDisplay(v)); setError(''); }} />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.label}>DESCRIPTION</Text>
          <TextInput style={styles.input} value={description} onChangeText={setDescription} />
          <Text style={styles.label}>DATE</Text>
          <TextInput style={styles.input} value={date} onChangeText={setDate} />
          <Text style={styles.label}>NOTES</Text>
          <TextInput style={[styles.input, { height: 80 }]} value={notes} onChangeText={setNotes} multiline />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}><Text style={styles.saveButtonText}>Update</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============ CHANGE PASSWORD ============
export function ChangePasswordScreen({ navigation }: any) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    const { verifyPassword, createPasswordHash, getAuth, saveAuth } = await import('../db/database');
    const auth = await getAuth();
    const valid = await verifyPassword(current, auth.password_hash, auth.salt);
    if (!valid) { setError('Current password galat hai'); return; }
    if (newPass.length < 8) { setError('Min 8 characters'); return; }
    if (newPass !== confirm) { setError('Passwords match nahi'); return; }
    const { hash, salt } = await createPasswordHash(newPass);
    await saveAuth(hash, salt);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backButton}>‹</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.content}>
          <Text style={styles.label}>CURRENT PASSWORD</Text>
          <TextInput style={styles.input} secureTextEntry value={current} onChangeText={setCurrent} />
          <Text style={styles.label}>NEW PASSWORD</Text>
          <TextInput style={styles.input} secureTextEntry value={newPass} onChangeText={setNewPass} placeholder="Min 8 chars" />
          <Text style={styles.label}>CONFIRM</Text>
          <TextInput style={styles.input} secureTextEntry value={confirm} onChangeText={setConfirm} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}><Text style={styles.saveButtonText}>Update</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============ SET PIN ============
export function SetPinScreen({ navigation }: any) {
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (pin.length !== 4 && pin.length !== 6) { setError('PIN 4 or 6 digits hona chahiye'); return; }
    if (pin !== confirm) { setError('PINs match nahi'); return; }
    const { updateSetting } = await import('../db/database');
    await updateSetting('pin_enabled', 'true');
    await updateSetting('pin', pin);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backButton}>‹</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>PIN Setup</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.content}>
          <Text style={styles.label}>NEW PIN</Text>
          <TextInput style={styles.input} secureTextEntry keyboardType="numeric" maxLength={6} value={pin} onChangeText={setPin} placeholder="4 or 6 digits" />
          <Text style={styles.label}>CONFIRM PIN</Text>
          <TextInput style={styles.input} secureTextEntry keyboardType="numeric" maxLength={6} value={confirm} onChangeText={setConfirm} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}><Text style={styles.saveButtonText}>Save PIN</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============ SHARED STYLES ============
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
  detailCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', padding: 20, alignItems: 'center', marginBottom: 16 },
  detailLabel: { fontSize: 10, color: '#777B75', letterSpacing: 1, marginBottom: 8 },
  detailAmount: { fontSize: 28, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  infoCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', marginBottom: 24 },
  infoRow: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E4E5DF' },
  infoLabel: { fontSize: 10, color: '#777B75', letterSpacing: 0.5, marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#20231F' },
  actionRow: { flexDirection: 'row', gap: 12 },
  editButton: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', paddingVertical: 14, alignItems: 'center' },
  editButtonText: { fontSize: 14, fontWeight: '600', color: '#20231F' },
  deleteButton: { flex: 1, backgroundColor: '#B84C43', paddingVertical: 14, alignItems: 'center' },
  deleteButtonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  debtCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', padding: 12, marginBottom: 8 },
  debtCardActive: { borderColor: '#376B4B', backgroundColor: '#376B4B08' },
  debtPerson: { fontSize: 14, fontWeight: '500', color: '#20231F' },
  debtAmount: { fontSize: 12, color: '#777B75', marginTop: 4 },
});
