import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { calculateBalance, getCategories, getTransactions } from '../db/database';
import { formatCurrency } from '../utils/currency';
import { getToday, getMonthStart, getMonthEnd } from '../utils/date';

export default function ReportsScreen({ navigation }: any) {
  const [period, setPeriod] = useState<'daily' | 'monthly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const [summary, setSummary] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    const startDate = period === 'daily' ? getToday() : getMonthStart(selectedMonth.year, selectedMonth.month);
    const endDate = period === 'daily' ? getToday() : getMonthEnd(selectedMonth.year, selectedMonth.month);
    
    const txs = await getTransactions();
    const filtered = txs.filter(t => t.transaction_date >= startDate && t.transaction_date <= endDate);
    
    const moneyReceived = filtered.filter(t => ['gift_allowance', 'family_money', 'person_money', 'other_income'].includes(t.transaction_type)).reduce((s, t) => s + t.amount, 0);
    const earnedIncome = filtered.filter(t => t.transaction_type === 'earned_income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = filtered.filter(t => t.transaction_type === 'expense').reduce((s, t) => s + t.amount, 0);
    const borrowedFunds = filtered.filter(t => t.transaction_type === 'borrowed_money').reduce((s, t) => s + t.amount, 0);
    const cashIn = filtered.filter(t => ['earned_income', 'gift_allowance', 'family_money', 'person_money', 'borrowed_money', 'loan_repayment_received', 'other_income'].includes(t.transaction_type)).reduce((s, t) => s + t.amount, 0);
    const cashOut = filtered.filter(t => ['expense', 'repayment'].includes(t.transaction_type)).reduce((s, t) => s + t.amount, 0);
    
    setSummary({
      money_received: moneyReceived,
      earned_income: earnedIncome,
      total_expenses: totalExpenses,
      borrowed_funds: borrowedFunds,
      net_movement: cashIn - cashOut,
    });

    // Category breakdown
    const expenses = filtered.filter(t => t.transaction_type === 'expense');
    const catMap: Record<string, number> = {};
    for (const tx of expenses) {
      const catId = tx.category_id || 'uncategorized';
      catMap[catId] = (catMap[catId] || 0) + tx.amount;
    }
    
    const categories = await getCategories();
    const breakdownData = Object.entries(catMap).map(([catId, total]) => {
      const cat = categories.find((c: any) => c.id === catId);
      return { category_id: catId, category_name: cat?.name || 'Uncategorized', total };
    }).sort((a, b) => b.total - a.total);
    
    setBreakdown(breakdownData);
  }, [period, selectedMonth]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const navigateMonth = (dir: number) => {
    setSelectedMonth(prev => {
      let m = prev.month + dir;
      let y = prev.year;
      if (m > 12) { m = 1; y++; }
      if (m < 1) { m = 12; y--; }
      return { year: y, month: m };
    });
  };

  const monthLabel = new Date(selectedMonth.year, selectedMonth.month - 1).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });
  const maxCat = breakdown.length > 0 ? breakdown[0].total : 1;

  if (!summary) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Period Toggle */}
        <View style={styles.periodToggle}>
          <TouchableOpacity style={[styles.periodBtn, period === 'daily' && styles.periodBtnActive]} onPress={() => setPeriod('daily')}>
            <Text style={[styles.periodBtnText, period === 'daily' && styles.periodBtnTextActive]}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.periodBtn, period === 'monthly' && styles.periodBtnActive]} onPress={() => setPeriod('monthly')}>
            <Text style={[styles.periodBtnText, period === 'monthly' && styles.periodBtnTextActive]}>Monthly</Text>
          </TouchableOpacity>
        </View>

        {/* Month Selector */}
        {period === 'monthly' && (
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={() => navigateMonth(-1)}><Text style={styles.chevron}>‹</Text></TouchableOpacity>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <TouchableOpacity onPress={() => navigateMonth(1)}><Text style={styles.chevron}>›</Text></TouchableOpacity>
          </View>
        )}

        {/* Net Movement */}
        <View style={styles.netCard}>
          <Text style={styles.netLabel}>NET MOVEMENT</Text>
          <Text style={[styles.netAmount, { color: summary.net_movement >= 0 ? '#34764A' : '#B84C43' }]}>
            {summary.net_movement >= 0 ? '+' : ''}{formatCurrency(summary.net_movement)}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}><Text style={styles.statLabel}>Received</Text><Text style={[styles.statValue, { color: '#34764A' }]}>{formatCurrency(summary.money_received)}</Text></View>
          <View style={styles.statCard}><Text style={styles.statLabel}>Earned</Text><Text style={[styles.statValue, { color: '#34764A' }]}>{formatCurrency(summary.earned_income)}</Text></View>
          <View style={styles.statCard}><Text style={styles.statLabel}>Expenses</Text><Text style={[styles.statValue, { color: '#B84C43' }]}>{formatCurrency(summary.total_expenses)}</Text></View>
          <View style={styles.statCard}><Text style={styles.statLabel}>Borrowed</Text><Text style={styles.statValue}>{formatCurrency(summary.borrowed_funds)}</Text></View>
        </View>

        {/* Category Breakdown */}
        <Text style={styles.sectionTitle}>EXPENSE BREAKDOWN</Text>
        {breakdown.length === 0 ? (
          <View style={styles.emptyCard}><Text style={styles.emptyText}>No expenses in this period</Text></View>
        ) : (
          <View style={styles.breakdownList}>
            {breakdown.map(cat => (
              <View key={cat.category_id} style={styles.breakdownRow}>
                <View style={styles.breakdownHeader}>
                  <Text style={styles.breakdownName}>{cat.category_name}</Text>
                  <Text style={styles.breakdownAmount}>{formatCurrency(cat.total)}</Text>
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${(cat.total / maxCat) * 100}%` }]} />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { label: 'Home', icon: '⌂', screen: 'Dashboard' },
          { label: 'History', icon: '☰', screen: 'Transactions' },
          { label: 'Reports', icon: '◔', screen: 'Reports', active: true },
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
  periodToggle: { flexDirection: 'row', margin: 16, backgroundColor: '#EFEFE9', padding: 4 },
  periodBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  periodBtnActive: { backgroundColor: '#FFFFFF' },
  periodBtnText: { fontSize: 12, fontWeight: '600', color: '#777B75' },
  periodBtnTextActive: { color: '#20231F' },
  monthSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, marginBottom: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', paddingHorizontal: 16, paddingVertical: 12 },
  chevron: { fontSize: 20, color: '#777B75', paddingHorizontal: 8 },
  monthLabel: { fontSize: 14, fontWeight: '600', color: '#20231F' },
  netCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', padding: 16 },
  netLabel: { fontSize: 10, color: '#777B75', letterSpacing: 1, marginBottom: 4 },
  netAmount: { fontSize: 24, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, gap: 12, marginBottom: 20 },
  statCard: { flex: 1, minWidth: '45%', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', padding: 14 },
  statLabel: { fontSize: 10, color: '#777B75', letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#20231F', fontVariant: ['tabular-nums'] },
  sectionTitle: { fontSize: 10, fontWeight: '500', color: '#777B75', letterSpacing: 1, paddingHorizontal: 16, marginBottom: 12 },
  emptyCard: { marginHorizontal: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#777B75' },
  breakdownList: { marginHorizontal: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF' },
  breakdownRow: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E4E5DF' },
  breakdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  breakdownName: { fontSize: 14, fontWeight: '500', color: '#20231F' },
  breakdownAmount: { fontSize: 14, fontWeight: '600', color: '#20231F', fontVariant: ['tabular-nums'] },
  barBg: { width: '100%', height: 4, backgroundColor: '#EFEFE9' },
  barFill: { height: '100%', backgroundColor: '#B84C43' },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E4E5DF', paddingBottom: 20 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabIcon: { fontSize: 20, color: '#777B75' },
  tabIconActive: { color: '#376B4B' },
  tabLabel: { fontSize: 10, color: '#777B75', marginTop: 4, fontWeight: '500' },
  tabLabelActive: { color: '#376B4B' },
  tabIndicator: { width: 32, height: 2, backgroundColor: '#376B4B', marginTop: 4 },
});
