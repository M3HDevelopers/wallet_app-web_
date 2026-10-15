import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, StatusBar as RNStatusBar, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { calculateBalance, getTransactions, getSettings } from '../db/database';
import { formatCurrency } from '../utils/currency';
import { getCurrentGreeting, getCurrentDateFormatted, formatDate } from '../utils/date';

// Memoized components for performance
const StatCard = React.memo(({ label, value, color }: { label: string; value: number; color: string }) => (
  <View style={statStyles.card}>
    <Text style={statStyles.label}>{label}</Text>
    <Text style={[statStyles.value, { color }]}>{formatCurrency(value)}</Text>
  </View>
));

const TxRow = React.memo(({ tx, onPress }: { tx: any; onPress: () => void }) => {
  const isOut = tx.transaction_type === 'expense' || tx.transaction_type === 'repayment';
  const getTxLabel = (type: string) => {
    const map: Record<string, string> = {
      earned_income: 'Earned', gift_allowance: 'Gift', family_money: 'Family',
      person_money: 'Received', borrowed_money: 'Borrowed', expense: 'Expense',
      repayment: 'Repaid', other_income: 'Other', loan_repayment_received: 'Loan Repaid',
    };
    return map[type] || 'Tx';
  };

  return (
    <TouchableOpacity
      style={styles.txRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.txIcon, { backgroundColor: isOut ? '#B84C4315' : '#34764A15' }]}>
        <Text style={[styles.txIconText, { color: isOut ? '#B84C43' : '#34764A' }]}>
          {isOut ? '↓' : '↑'}
        </Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txDescription} numberOfLines={1}>{tx.description || getTxLabel(tx.transaction_type)}</Text>
        <Text style={styles.txMeta}>{getTxLabel(tx.transaction_type)} · {formatDate(tx.transaction_date)}</Text>
      </View>
      <Text style={[styles.txAmount, { color: isOut ? '#B84C43' : '#34764A' }]}>
        {isOut ? '-' : '+'}{formatCurrency(tx.amount)}
      </Text>
    </TouchableOpacity>
  );
});

export default function DashboardScreen({ navigation, onLock }: any) {
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [hideBalance, setHideBalance] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const loadData = React.useCallback(async () => {
    try {
      const [bal, txs, settings] = await Promise.all([
        calculateBalance(),
        getTransactions(),
        getSettings(),
      ]);
      setBalance(bal);
      setTransactions(txs.slice(0, 6));
      setHideBalance(settings.hide_balance === 'true');
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [fadeAnim]);

  useFocusEffect(React.useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  if (!balance) return null;

  return (
    <View style={styles.container}>
      {/* Status Bar - Dark overlay for visibility */}
      <View style={styles.statusBarOverlay}>
        <RNStatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getCurrentGreeting()}</Text>
            <Text style={styles.date}>{getCurrentDateFormatted()}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
            <Text style={styles.settingsIcon}>⚙</Text>
          </TouchableOpacity>
        </View>

        <Animated.ScrollView 
          style={[styles.scroll, { opacity: fadeAnim }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#376B4B" />}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>CURRENT BALANCE</Text>
              <TouchableOpacity onPress={() => setHideBalance(!hideBalance)} activeOpacity={0.7}>
                <Text style={styles.eyeIcon}>{hideBalance ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceAmount}>
              {hideBalance ? 'Rs. ••••••' : formatCurrency(balance.current_balance)}
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard label="Total Income" value={balance.total_income} color="#34764A" />
            <StatCard label="Total Expenses" value={balance.total_expenses} color="#B84C43" />
            <StatCard label="Borrowed" value={balance.total_borrowed} color="#20231F" />
            <StatCard label="Outstanding" value={balance.outstanding_debt} color="#B84C43" />
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          <View style={styles.quickActions}>
            {[
              { label: 'Income', icon: '↑', screen: 'AddMoney' },
              { label: 'Expense', icon: '↓', screen: 'AddExpense' },
              { label: 'Borrow', icon: '↗', screen: 'AddBorrow' },
              { label: 'Repay', icon: '↙', screen: 'AddRepay' },
            ].map(item => (
              <TouchableOpacity 
                key={item.label} 
                style={styles.actionButton}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.7}
              >
                <Text style={styles.actionIcon}>{item.icon}</Text>
                <Text style={styles.actionLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Outstanding Debt Alert */}
          {balance.outstanding_debt > 0 && (
            <TouchableOpacity 
              style={styles.debtAlert}
              onPress={() => navigation.navigate('AddRepay')}
              activeOpacity={0.7}
            >
              <View>
                <Text style={styles.debtAlertLabel}>OUTSTANDING DEBT</Text>
                <Text style={styles.debtAlertAmount}>{formatCurrency(balance.outstanding_debt)}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}

          {/* Recent Transactions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT</Text>
            {transactions.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('Transactions')} activeOpacity={0.7}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySubtitle}>Add your first transaction to get started</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => navigation.navigate('AddMoney')}
                activeOpacity={0.7}
              >
                <Text style={styles.emptyButtonText}>Add Money</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.txList}>
              {transactions.map(tx => (
                <TxRow 
                  key={tx.id} 
                  tx={tx} 
                  onPress={() => navigation.navigate('TransactionDetail', { txId: tx.id })} 
                />
              ))}
            </View>
          )}
        </Animated.ScrollView>

        {/* Bottom Tab Bar */}
        <View style={styles.tabBar}>
          {[
            { label: 'Home', icon: '⌂', screen: 'Dashboard', active: true },
            { label: 'History', icon: '☰', screen: 'Transactions' },
            { label: 'Reports', icon: '◔', screen: 'Reports' },
            { label: 'Settings', icon: '⚙', screen: 'Settings' },
          ].map(tab => (
            <TouchableOpacity 
              key={tab.label} 
              style={styles.tab}
              onPress={() => navigation.navigate(tab.screen)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabIcon, tab.active && styles.tabIconActive]}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, tab.active && styles.tabLabelActive]}>{tab.label}</Text>
              {tab.active && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* FAB */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('AddMoney')}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: { flex: 1, minWidth: '45%', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', padding: 14 },
  label: { fontSize: 10, color: '#777B75', letterSpacing: 0.5, marginBottom: 4 },
  value: { fontSize: 16, fontWeight: 'bold', color: '#20231F', fontVariant: ['tabular-nums'] },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F3' },
  statusBarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 44 : 25,
    backgroundColor: 'rgba(32, 35, 31, 0.85)',
    zIndex: 999,
  },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  greeting: { fontSize: 14, color: '#777B75' },
  date: { fontSize: 12, color: '#777B75', marginTop: 2 },
  settingsIcon: { fontSize: 20, color: '#777B75' },
  scroll: { flex: 1 },
  balanceCard: { margin: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', padding: 20 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  balanceLabel: { fontSize: 10, color: '#777B75', letterSpacing: 1 },
  eyeIcon: { fontSize: 16 },
  balanceAmount: { fontSize: 32, fontWeight: 'bold', color: '#20231F', fontVariant: ['tabular-nums'] },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 20, gap: 12, marginBottom: 20 },
  sectionTitle: { fontSize: 10, fontWeight: '500', color: '#777B75', letterSpacing: 1, paddingHorizontal: 20, marginBottom: 12 },
  quickActions: { flexDirection: 'row', marginHorizontal: 20, gap: 8, marginBottom: 20 },
  actionButton: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', paddingVertical: 14, alignItems: 'center' },
  actionIcon: { fontSize: 18, color: '#376B4B', marginBottom: 6 },
  actionLabel: { fontSize: 10, color: '#20231F', fontWeight: '500' },
  debtAlert: { marginHorizontal: 20, marginBottom: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#B84C4330', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  debtAlertLabel: { fontSize: 10, color: '#777B75', letterSpacing: 1 },
  debtAlertAmount: { fontSize: 18, fontWeight: 'bold', color: '#B84C43', marginTop: 4, fontVariant: ['tabular-nums'] },
  chevron: { fontSize: 20, color: '#777B75' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  viewAll: { fontSize: 12, color: '#376B4B', fontWeight: '600' },
  emptyState: { marginHorizontal: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', padding: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 14, fontWeight: '500', color: '#20231F', marginBottom: 4 },
  emptySubtitle: { fontSize: 12, color: '#777B75', marginBottom: 16 },
  emptyButton: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#376B4B' },
  emptyButtonText: { fontSize: 14, color: '#FFFFFF', fontWeight: '500' },
  txList: { marginHorizontal: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF' },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E4E5DF' },
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
  fab: { position: 'absolute', bottom: 90, right: 20, width: 56, height: 56, backgroundColor: '#376B4B', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#376B4B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  fabText: { fontSize: 28, color: '#FFFFFF', fontWeight: '300', marginTop: -2 },
});
