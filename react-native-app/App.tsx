import React, { useState, useEffect } from 'react';
import { View, StatusBar as RNStatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import SetupScreen from './src/screens/SetupScreen';
import LockScreen from './src/screens/LockScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AddMoneyScreen from './src/screens/AddMoneyScreen';
import { AddExpenseScreen, AddBorrowScreen, AddRepayScreen, TransactionDetailScreen, EditTransactionScreen, ChangePasswordScreen, SetPinScreen } from './src/screens/OtherScreens';

import { initializeDB, getAuth } from './src/db/database';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialScreen, setInitialScreen] = useState('Lock');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    await initializeDB();
    const auth = await getAuth();
    
    if (!auth.is_setup) {
      setInitialScreen('Welcome');
    } else {
      setInitialScreen('Lock');
    }
    
    setIsReady(true);
  };

  const handleUnlock = () => {
    setIsAuthenticated(true);
  };

  const handleLock = () => {
    setIsAuthenticated(false);
  };

  if (!isReady) {
    return null; // Splash screen will show
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* Global Status Bar Overlay - Dark background for visibility */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 44 : 30,
          backgroundColor: 'rgba(32, 35, 31, 0.85)',
          zIndex: 9999,
        }} />
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            initialRouteName={initialScreen}
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          >
            {/* Auth Screens */}
            <Stack.Screen name="Welcome">
              {(props) => <WelcomeScreen {...props} />}
            </Stack.Screen>
            
            <Stack.Screen name="Setup">
              {(props) => <SetupScreen {...props} onComplete={handleUnlock} />}
            </Stack.Screen>
            
            <Stack.Screen name="Lock">
              {(props) => <LockScreen {...props} onUnlock={handleUnlock} />}
            </Stack.Screen>

            {/* Main App Screens */}
            {isAuthenticated && (
              <>
                <Stack.Screen name="Dashboard">
                  {(props) => <DashboardScreen {...props} onLock={handleLock} />}
                </Stack.Screen>
                
                <Stack.Screen name="Transactions">
                  {(props) => <TransactionsScreen {...props} />}
                </Stack.Screen>
                
                <Stack.Screen name="Reports">
                  {(props) => <ReportsScreen {...props} />}
                </Stack.Screen>
                
                <Stack.Screen name="Settings">
                  {(props) => <SettingsScreen {...props} onLock={handleLock} />}
                </Stack.Screen>

                {/* Transaction Screens */}
                <Stack.Screen name="AddMoney" component={AddMoneyScreen} />
                <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
                <Stack.Screen name="AddBorrow" component={AddBorrowScreen} />
                <Stack.Screen name="AddRepay" component={AddRepayScreen} />
                <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
                <Stack.Screen name="EditTransaction" component={EditTransactionScreen} />

                {/* Settings Screens */}
                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                <Stack.Screen name="SetPin" component={SetPinScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
