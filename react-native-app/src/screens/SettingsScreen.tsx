import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getSettings, updateSetting, resetAllData } from '../db/database';

export default function SettingsScreen({ navigation, onLock }: any) {
  const [settings, setSettings] = useState<any>({});
  const toggleAnimation = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    loadSettings();
  }, []);

  React.useEffect(() => {
    Animated.timing(toggleAnimation, {
      toValue: settings.hide_balance === 'true' ? 1 : 0,
      duration: 200,
      useNativeDriver: true, // Use native driver for better performance
    }).start();
  }, [settings.hide_balance]);

  const loadSettings = async () => {
    const s = await getSettings();
    setSettings(s);
  };

  const toggleHideBalance = async () => {
    const newVal = settings.hide_balance === 'true' ? 'false' : 'true';
    await updateSetting('hide_balance', newVal);
    setSettings({ ...settings, hide_balance: newVal });
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'All data will be permanently deleted. This action cannot be undone. Make sure to create a backup first.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          await resetAllData();
          Alert.alert('Done', 'All data has been reset', [{ text: 'OK', onPress: () => onLock() }]);
        }},
      ]
    );
  };

  const translateX = toggleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  // For backgroundColor, we need to use state since native driver doesn't support color interpolation
  const toggleBgColor = settings.hide_balance === 'true' ? '#376B4B' : '#E4E5DF';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.sectionTitle}>SECURITY</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ChangePassword')}>
            <Text style={styles.rowIcon}>🔑</Text>
            <Text style={styles.rowLabel}>Change Password</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('SetPin')}>
            <Text style={styles.rowIcon}>🔢</Text>
            <Text style={styles.rowLabel}>PIN Setup</Text>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{settings.pin_enabled === 'true' ? 'On' : 'Off'}</Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={toggleHideBalance} activeOpacity={0.7}>
            <Text style={styles.rowIcon}>🙈</Text>
            <Text style={styles.rowLabel}>Hide Balance</Text>
            <View style={[styles.toggle, { backgroundColor: toggleBgColor }]}>
              <Animated.View style={[styles.toggleKnob, { transform: [{ translateX }] }]} />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>DATA</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Export', 'Backup export feature coming soon')}>
            <Text style={styles.rowIcon}>📤</Text>
            <Text style={styles.rowLabel}>Export Backup</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Import', 'Restore feature coming soon')}>
            <Text style={styles.rowIcon}>📥</Text>
            <Text style={styles.rowLabel}>Restore Backup</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={handleReset}>
            <Text style={styles.rowIcon}>🗑</Text>
            <Text style={[styles.rowLabel, { color: '#B84C43' }]}>Reset All Data</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.lockButton} onPress={onLock}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockText}>Lock App</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {[
          { label: 'Home', icon: '⌂', screen: 'Dashboard' },
          { label: 'History', icon: '☰', screen: 'Transactions' },
          { label: 'Reports', icon: '◔', screen: 'Reports' },
          { label: 'Settings', icon: '⚙', screen: 'Settings', active: true },
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
  sectionTitle: { fontSize: 10, fontWeight: '500', color: '#777B75', letterSpacing: 1, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  section: { marginHorizontal: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E4E5DF' },
  rowIcon: { fontSize: 16, marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#20231F' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue: { fontSize: 12, color: '#777B75' },
  chevron: { fontSize: 18, color: '#777B75' },
  toggle: { width: 44, height: 24, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 2 },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' },
  lockButton: { marginHorizontal: 16, marginTop: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E5DF', paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  lockIcon: { fontSize: 14 },
  lockText: { fontSize: 14, fontWeight: '500', color: '#20231F' },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E4E5DF', paddingBottom: 20 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabIcon: { fontSize: 20, color: '#777B75' },
  tabIconActive: { color: '#376B4B' },
  tabLabel: { fontSize: 10, color: '#777B75', marginTop: 4, fontWeight: '500' },
  tabLabelActive: { color: '#376B4B' },
  tabIndicator: { width: 32, height: 2, backgroundColor: '#376B4B', marginTop: 4 },
});
