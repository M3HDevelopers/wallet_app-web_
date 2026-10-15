import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { searchTransactions } from '../db/database';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';

export default function TransactionsScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filterType, setFilterType] = useState('');

  const loadData = useCallback(async () => {
    const txs = await searchTransactions(query, { type: filterType || undefined });
    setTransactions(txs);
  }, [query, filterType]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const isOutgoing = (type: string) => type === 'expense' || type === 'repayment';

  const getTxLabel = (type: string) => {
    const map: Record<string, string> = {
      earned_income: 'Earned', gift_allowance: 'Gift', family_money: 'Family',
      person_money: 'Received', borrowed_money: 'Borrowed', expense: 'Expense',
      repayment: 'Repaid', other_income: 'Other', loan_repayment_received: 'Loan Repaid',
    };
    return map[type] || 'Tx';
  };

  const renderTx = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.txRow}
      onPress={() => navigation.navigate('TransactionDetail', { txId: item.id })}
      activeOpacity={0.7}
    >
      <View style={[styles.txIcon, { backgroundColor: isOutgoing(item.transaction_type) ? '#B84C4315' : '#34764A15' }]}>
        <Text style={[styles.txIconText, { color: isOutgoing(item.transaction_type) ? '#B84C43' : '#34764A' }]}>
          {isOutgoing(item.transaction_type) ? '↓' : '↑'}
        </Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txDescription} numberOfLines={1}>{item.description || getTxLabel(item.transaction_type)}</Text>
        <Text style={styles.txMeta}>{getTxLabel(item.transaction_type)} · {formatDate(item.transaction_date)}</Text>
      </View>
      <Text style={[styles.txAmount, { color: isOutgoing(item.transaction_type) ? '#B84C43' : '#34764A' }]}>
        {isOutgoing(item.transaction_type) ? '-' : '+'}{formatCurrency(item.amount)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#777B75"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {[
          { label: 'All', value: '' },
          { label: 'Expenses', value: 'expense' },
          { label: 'Earned', value: 'earned_income' },
          { label: 'Borrowed', value: 'borrowed_money' },
          { label: 'Repaid', value: 'repayment' },
          { label: 'Gifts', value: 'gift_allowance' },
        ].map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filterType === f.value && styles.filterChipActive]}
            onPress={() => setFilterType(f.value)}
          >
            <Text style={[styles.filterChipText, filterType === f.value && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {transactions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No transactions found</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={renderTx}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { label: 'Home', icon: '⌂', screen: 'Dashboard' },
          { label: 'History', icon: '☰', screen: 'Transactions', active: true },
          { label: 'Reports', icon: '◔', screen: 'Reports' },
          { label: 'Settings', icon: '⚙', screen: 'Settings' },
        ].map(tab => (
          <TouchableOpacity key={tab.label} style={styles.tab} onPress={() => navigation.navigate(tab.screen)}>
            <Text style={[styles.tabIcon, tab.active && styles.tabIconActive]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, tab.active && styles.tabLabelActive]}>{tab.label}</Text>
            {tab.active && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F3' },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E4E5DF', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#20231F' },
  searchRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', paddingHorizontal: 12, paddingVertical: 10 },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#20231F' },
  filters: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 8, overflowX: 'scroll' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#E4E5DF', backgroundColor: '#FFFFFF' },
  filterChipActive: { backgroundColor: '#376B4B', borderColor: '#376B4B' },
  filterChipText: { fontSize: 12, fontWeight: '500', color: '#20231F' },
  filterChipTextActive: { color: '#FFFFFF' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 14, color: '#777B75' },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E4E5DF', backgroundColor: '#FFFFFF' },
  txIcon: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txIconText: { fontSize: 14, fontWeight: 'bold' },
  txInfo: { flex: 1 },
  txDescription: { fontSize: 14, fontWeight: '500', color: '#20231F' },
  txMeta: { fontSize: 11, color: '#777B75', marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'], marginLeft: 8 },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E4E5DF', paddingBottom: 20 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabIcon: { fontSize: 20, color: '#777B75' },
  tabIconActive: { color: '#376B4B' },
  tabLabel: { fontSize: 10, color: '#777B75', marginTop: 4, fontWeight: '500' },
  tabLabelActive: { color: '#376B4B' },
  tabIndicator: { width: 32, height: 2, backgroundColor: '#376B4B', marginTop: 4 },
});
