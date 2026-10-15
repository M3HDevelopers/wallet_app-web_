import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as db from './db/database';
import { createPasswordHash, verifyPassword, validatePassword, validatePin } from './utils/auth';
import { formatCurrency, parseAmountInput } from './utils/currency';
import { getCurrentGreeting, getCurrentDateFormatted, getToday } from './utils/date';
import type { TransactionType } from './types';
import {
  Home, List, PieChart, Settings as SettingsIcon, Plus, Search,
  Lock, Eye, EyeOff, Download, Upload, Trash2, ChevronRight, ChevronLeft,
  Wallet, TrendingUp, TrendingDown, CreditCard, Shield, Filter, X, Check
} from 'lucide-react';

type Screen = 'welcome' | 'setup' | 'lock' | 'dashboard' | 'transactions' | 'reports' | 'settings' | 'add-money' | 'add-expense' | 'add-borrow' | 'add-repay' | 'transaction-detail' | 'edit-transaction' | 'change-password' | 'set-pin';

const pageVariants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '-30%', opacity: 0 },
};

const pageTransition = { type: 'tween', duration: 0.28, ease: [0.25, 0.1, 0.25, 1] };

export default function App() {
  const [screen, setScreen] = useState<Screen>('lock');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<Screen[]>([]);

  const refresh = () => setRefreshKey(k => k + 1);

  const navigate = (s: Screen) => {
    setHistory(h => [...h, screen]);
    setScreen(s);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setScreen(prev);
    }
  };

  useEffect(() => {
    db.initializeDB();
    const auth = db.getAuth();
    if (!auth.is_setup) {
      setScreen('welcome');
    } else {
      setScreen('lock');
    }
    setLoading(false);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  if (loading) {
    return (
      <div className="h-full w-full bg-[#F7F7F3] flex items-center justify-center">
        <div className="w-10 h-10 bg-[#376B4B] flex items-center justify-center">
          <Wallet size={20} className="text-white" />
        </div>
      </div>
    );
  }

  const isModal = ['add-money', 'add-expense', 'add-borrow', 'add-repay', 'edit-transaction', 'transaction-detail', 'change-password', 'set-pin'].includes(screen);

  return (
    <div className="h-full w-full bg-[#F7F7F3] flex flex-col overflow-hidden max-w-md mx-auto relative">
      {/* Status Bar Spacer */}
      <div className="h-[env(safe-area-inset-top)] bg-[#F7F7F3] flex-shrink-0" />
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="absolute inset-0 flex flex-col overflow-hidden"
          >
            {screen === 'welcome' && <WelcomeScreen onNext={() => navigate('setup')} />}
            {screen === 'setup' && <SetupScreen onComplete={() => { setIsAuthenticated(true); setHistory([]); setScreen('dashboard'); }} showToast={showToast} />}
            {screen === 'lock' && !isAuthenticated && <LockScreen onUnlock={() => { setIsAuthenticated(true); setHistory([]); setScreen('dashboard'); }} showToast={showToast} />}
            {screen === 'dashboard' && <DashboardScreen navigate={navigate} refreshKey={refreshKey} onSelectTx={(id) => { setSelectedTxId(id); navigate('transaction-detail'); }} />}
            {screen === 'transactions' && <TransactionsScreen navigate={navigate} onSelectTx={(id) => { setSelectedTxId(id); navigate('transaction-detail'); }} />}
            {screen === 'reports' && <ReportsScreen />}
            {screen === 'settings' && <SettingsScreen navigate={navigate} showToast={showToast} onLock={() => { setIsAuthenticated(false); setHistory([]); setScreen('lock'); }} />}
            {screen === 'add-money' && <AddMoneyScreen goBack={goBack} onSave={() => { refresh(); goBack(); showToast('Money added'); }} />}
            {screen === 'add-expense' && <AddExpenseScreen goBack={goBack} onSave={() => { refresh(); goBack(); showToast('Expense saved'); }} />}
            {screen === 'add-borrow' && <AddBorrowScreen goBack={goBack} onSave={() => { refresh(); goBack(); showToast('Borrowing recorded'); }} />}
            {screen === 'add-repay' && <AddRepayScreen goBack={goBack} onSave={() => { refresh(); goBack(); showToast('Repayment recorded'); }} />}
            {screen === 'transaction-detail' && selectedTxId && (
              <TransactionDetailScreen txId={selectedTxId} goBack={goBack} onEdit={() => navigate('edit-transaction')} onDelete={() => { refresh(); goBack(); showToast('Deleted'); }} />
            )}
            {screen === 'edit-transaction' && selectedTxId && (
              <EditTransactionScreen txId={selectedTxId} goBack={goBack} onSave={() => { refresh(); goBack(); showToast('Updated'); }} />
            )}
            {screen === 'change-password' && <ChangePasswordScreen goBack={goBack} showToast={showToast} />}
            {screen === 'set-pin' && <SetPinScreen goBack={goBack} showToast={showToast} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Tab Bar */}
      {!isModal && ['dashboard', 'transactions', 'reports', 'settings'].includes(screen) && isAuthenticated && (
        <TabBar current={screen} navigate={(s) => { setHistory([]); setScreen(s); }} />
      )}

      {/* FAB */}
      {screen === 'dashboard' && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('add-money')}
          className="absolute bottom-24 right-5 w-14 h-14 bg-[#376B4B] flex items-center justify-center z-40 shadow-[0_4px_12px_rgba(55,107,75,0.3)]"
        >
          <Plus size={24} className="text-white" strokeWidth={2.5} />
        </motion.button>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 bg-[#20231F] text-white text-sm font-medium flex items-center gap-2"
          >
            {toast.type === 'success' ? <Check size={14} /> : <X size={14} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ NATIVE NAV BAR ============
function NavBar({ title, onBack, rightAction }: { title: string; onBack?: () => void; rightAction?: React.ReactNode }) {
  return (
    <div className="flex-shrink-0 bg-[#F7F7F3] border-b border-[#E4E5DF]">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="w-10">
          {onBack && (
            <motion.button whileTap={{ scale: 0.85 }} onClick={onBack} className="flex items-center -ml-2">
              <ChevronLeft size={24} className="text-[#376B4B]" />
            </motion.button>
          )}
        </div>
        <h1 className="text-base font-semibold text-[#20231F] absolute left-1/2 -translate-x-1/2">{title}</h1>
        <div className="w-10 flex justify-end">{rightAction}</div>
      </div>
    </div>
  );
}

// ============ TAB BAR ============
function TabBar({ current, navigate }: { current: string; navigate: (s: Screen) => void }) {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'transactions', icon: List, label: 'History' },
    { id: 'reports', icon: PieChart, label: 'Reports' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="flex-shrink-0 bg-white border-t border-[#E4E5DF] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {tabs.map(tab => {
          const isActive = current === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate(tab.id as Screen)}
              className="flex flex-col items-center justify-center w-16 h-full relative"
            >
              <tab.icon size={22} strokeWidth={isActive ? 2.2 : 1.5} className={isActive ? 'text-[#376B4B]' : 'text-[#777B75]'} />
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-[#376B4B]' : 'text-[#777B75]'}`}>{tab.label}</span>
              {isActive && (
                <motion.div layoutId="tab-indicator" className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#376B4B]" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ============ WELCOME ============
function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 bg-[#F7F7F3]">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="w-20 h-20 bg-[#376B4B] flex items-center justify-center mx-auto mb-8">
          <Wallet size={36} className="text-white" />
        </div>
      </motion.div>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-center">
        <h1 className="text-2xl font-bold text-[#20231F] mb-3">Wallet Manager</h1>
        <p className="text-sm text-[#777B75] leading-relaxed mb-10 px-4">
          Apne paise, kharche, aur udhaar ko track karein. Saara data aapke device par safe hai.
        </p>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onNext} className="w-full py-4 bg-[#376B4B] text-white font-semibold text-base">
          Shuru Karein
        </motion.button>
      </motion.div>
    </div>
  );
}

// ============ SETUP ============
function SetupScreen({ onComplete, showToast }: { onComplete: () => void; showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [step, setStep] = useState(0);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [opening, setOpening] = useState('');
  const [error, setError] = useState('');

  const steps = ['Password banayein', 'Confirm karein', 'Opening Balance'];

  const handleNext = async () => {
    if (step === 0) {
      const err = validatePassword(password);
      if (err) { setError(err); return; }
      setError(''); setStep(1);
    } else if (step === 1) {
      if (password !== confirm) { setError('Password match nahi kar raha'); return; }
      setError(''); setStep(2);
    } else {
      const { hash, salt } = await createPasswordHash(password);
      db.saveAuth({ password_hash: hash, salt, is_setup: true });
      const amount = parseAmountInput(opening) || 0;
      db.updateSettings({ is_initialized: true, opening_balance: amount, opening_balance_date: getToday() });
      showToast('Setup complete!');
      onComplete();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F7F7F3]">
      <NavBar title="Setup" />
      <div className="flex-1 px-6 pt-8">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[0, 1, 2].map(i => (
            <div key={i} className={`flex-1 h-1 ${i <= step ? 'bg-[#376B4B]' : 'bg-[#E4E5DF]'}`} />
          ))}
        </div>

        <h2 className="text-xl font-bold text-[#20231F] mb-2">{steps[step]}</h2>
        <p className="text-sm text-[#777B75] mb-6">
          {step === 0 && 'Kam az kam 8 characters ka password banayein'}
          {step === 1 && 'Password dobara enter karein'}
          {step === 2 && 'Abhi kitne paise hain? (Skip kar sakte hain)'}
        </p>

        {step === 0 && (
          <div className="space-y-4">
            <NativeInput label="Password" type="password" value={password} onChange={setPassword} error={error} placeholder="Min 8 characters" autoFocus />
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <NativeInput label="Confirm Password" type="password" value={confirm} onChange={setConfirm} error={error} placeholder="Re-enter password" autoFocus />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <NativeAmountInput value={opening} onChange={setOpening} />
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setStep(step - 1); setError(''); }} className="flex-1 py-4 bg-[#EFEFE9] text-[#20231F] font-semibold">
              Back
            </motion.button>
          )}
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleNext} className="flex-1 py-4 bg-[#376B4B] text-white font-semibold">
            {step === 2 ? 'Finish' : 'Continue'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ============ LOCK SCREEN ============
function LockScreen({ onUnlock, showToast }: { onUnlock: () => void; showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const settings = db.getSettings();
  const auth = db.getAuth();
  const [usePin, setUsePin] = useState(settings.pin_enabled);
  const [pin, setPin] = useState('');

  const handleUnlock = async () => {
    if (usePin && settings.pin) {
      if (pin === settings.pin) { onUnlock(); }
      else { setError('Galat PIN'); setPin(''); }
      return;
    }
    const valid = await verifyPassword(password, auth.password_hash, auth.salt);
    if (valid) { onUnlock(); }
    else { setError('Galat password'); setPassword(''); }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 bg-[#F7F7F3]">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm">
        <div className="w-16 h-16 bg-[#376B4B] flex items-center justify-center mx-auto mb-6">
          <Lock size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-[#20231F] text-center mb-2">Wallet Locked</h2>
        <p className="text-sm text-[#777B75] text-center mb-8">
          {usePin ? 'PIN enter karein' : 'Password enter karein'}
        </p>

        {usePin ? (
          <NativeInput type="password" value={pin} onChange={(v) => { if (v.length <= 6) setPin(v); }} inputMode="numeric" error={error} placeholder="PIN" autoFocus />
        ) : (
          <NativeInput type="password" value={password} onChange={setPassword} error={error} placeholder="Password" autoFocus />
        )}

        <motion.button whileTap={{ scale: 0.97 }} onClick={handleUnlock} className="w-full mt-6 py-4 bg-[#376B4B] text-white font-semibold">
          Unlock
        </motion.button>

        {settings.pin_enabled && (
          <button onClick={() => { setUsePin(!usePin); setError(''); setPassword(''); setPin(''); }} className="w-full mt-4 text-sm text-[#376B4B] text-center">
            {usePin ? 'Password use karein' : 'PIN use karein'}
          </button>
        )}
      </motion.div>
    </div>
  );
}

// ============ DASHBOARD ============
function DashboardScreen({ navigate, refreshKey, onSelectTx }: { navigate: (s: Screen) => void; refreshKey: number; onSelectTx: (id: string) => void }) {
  const balance = db.calculateBalance();
  const settings = db.getSettings();
  const transactions = db.getTransactions().slice(0, 6);
  const [hideBalance, setHideBalance] = useState(settings.hide_balance);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F7F3]">
      {/* Header */}
      <div className="flex-shrink-0 px-5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#777B75]">{getCurrentGreeting()}</p>
            <p className="text-xs text-[#777B75] mt-0.5">{getCurrentDateFormatted()}</p>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('settings')} className="w-9 h-9 flex items-center justify-center">
            <SettingsIcon size={20} className="text-[#777B75]" />
          </motion.button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Balance Card */}
        <div className="px-5 mb-5">
          <motion.div layout className="bg-white border border-[#E4E5DF] p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#777B75] uppercase tracking-wider font-medium">Current Balance</p>
              <motion.button whileTap={{ scale: 0.8 }} onClick={() => setHideBalance(!hideBalance)}>
                {hideBalance ? <EyeOff size={16} className="text-[#777B75]" /> : <Eye size={16} className="text-[#777B75]" />}
              </motion.button>
            </div>
            <motion.p
              key={hideBalance ? 'h' : balance.current_balance}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 1 }}
              className="text-[32px] font-bold tabular-nums text-[#20231F] leading-tight"
            >
              {hideBalance ? 'Rs. ••••••' : formatCurrency(balance.current_balance)}
            </motion.p>
          </motion.div>
        </div>

        {/* Summary Grid */}
        <div className="px-5 mb-5">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total Income" value={balance.total_income} color="text-[#34764A]" />
            <StatCard label="Total Expenses" value={balance.total_expenses} color="text-[#B84C43]" />
            <StatCard label="Borrowed" value={balance.total_borrowed} color="text-[#20231F]" />
            <StatCard label="Outstanding" value={balance.outstanding_debt} color="text-[#B84C43]" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-5 mb-5">
          <p className="text-xs font-medium text-[#777B75] uppercase tracking-wider mb-3">Quick Actions</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Income', icon: TrendingUp, screen: 'add-money' as Screen },
              { label: 'Expense', icon: TrendingDown, screen: 'add-expense' as Screen },
              { label: 'Borrow', icon: CreditCard, screen: 'add-borrow' as Screen },
              { label: 'Repay', icon: Wallet, screen: 'add-repay' as Screen },
            ].map(item => (
              <motion.button
                key={item.label}
                whileTap={{ scale: 0.92 }}
                onClick={() => navigate(item.screen)}
                className="flex flex-col items-center py-3.5 bg-white border border-[#E4E5DF] active:bg-[#EFEFE9]"
              >
                <item.icon size={18} className="text-[#376B4B] mb-1.5" />
                <span className="text-[10px] text-[#20231F] font-medium">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Outstanding Debt Alert */}
        {balance.outstanding_debt > 0 && (
          <div className="px-5 mb-5">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('add-repay')}
              className="w-full bg-white border border-[#B84C43]/30 p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-[#777B75] uppercase tracking-wider">Outstanding Debt</p>
                <p className="text-lg font-bold tabular-nums text-[#B84C43] mt-0.5">{formatCurrency(balance.outstanding_debt)}</p>
              </div>
              <ChevronRight size={18} className="text-[#777B75]" />
            </motion.button>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="px-5 pb-24">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-[#777B75] uppercase tracking-wider">Recent</p>
            {transactions.length > 0 && (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('transactions')} className="text-xs text-[#376B4B] font-semibold">
                View All
              </motion.button>
            )}
          </div>

          {transactions.length === 0 ? (
            <div className="bg-white border border-[#E4E5DF] p-8 text-center">
              <p className="text-sm text-[#20231F] font-medium mb-1">Koi transaction nahi</p>
              <p className="text-xs text-[#777B75] mb-4">Pehla transaction add karein</p>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('add-money')} className="px-5 py-2.5 bg-[#376B4B] text-white text-sm font-medium">
                Add Money
              </motion.button>
            </div>
          ) : (
            <div className="bg-white border border-[#E4E5DF]">
              {transactions.map(tx => (
                <TxRow key={tx.id} tx={tx} onClick={() => onSelectTx(tx.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ TRANSACTIONS ============
function TransactionsScreen({ navigate, onSelectTx }: { navigate: (s: Screen) => void; onSelectTx: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('');
  const categories = db.getCategories();
  
  const transactions = db.searchTransactions(query, {
    type: (filterType as TransactionType) || undefined,
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F7F3]">
      <NavBar title="Transactions" />
      
      {/* Search Bar */}
      <div className="flex-shrink-0 px-4 py-3 flex gap-2">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777B75]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E4E5DF] text-sm focus:outline-none focus:border-[#376B4B]"
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowFilters(!showFilters)}
          className={`w-10 h-10 flex items-center justify-center border ${filterType ? 'bg-[#376B4B] border-[#376B4B]' : 'bg-white border-[#E4E5DF]'}`}
        >
          <Filter size={16} className={filterType ? 'text-white' : 'text-[#777B75]'} />
        </motion.button>
      </div>

      {showFilters && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex-shrink-0 px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setFilterType('')} className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap border ${!filterType ? 'bg-[#376B4B] text-white border-[#376B4B]' : 'bg-white text-[#20231F] border-[#E4E5DF]'}`}>All</button>
            <button onClick={() => setFilterType('expense')} className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap border ${filterType === 'expense' ? 'bg-[#376B4B] text-white border-[#376B4B]' : 'bg-white text-[#20231F] border-[#E4E5DF]'}`}>Expenses</button>
            <button onClick={() => setFilterType('earned_income')} className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap border ${filterType === 'earned_income' ? 'bg-[#376B4B] text-white border-[#376B4B]' : 'bg-white text-[#20231F] border-[#E4E5DF]'}`}>Earned</button>
            <button onClick={() => setFilterType('borrowed_money')} className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap border ${filterType === 'borrowed_money' ? 'bg-[#376B4B] text-white border-[#376B4B]' : 'bg-white text-[#20231F] border-[#E4E5DF]'}`}>Borrowed</button>
            <button onClick={() => setFilterType('repayment')} className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap border ${filterType === 'repayment' ? 'bg-[#376B4B] text-white border-[#376B4B]' : 'bg-white text-[#20231F] border-[#E4E5DF]'}`}>Repaid</button>
            <button onClick={() => setFilterType('gift_allowance')} className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap border ${filterType === 'gift_allowance' ? 'bg-[#376B4B] text-white border-[#376B4B]' : 'bg-white text-[#20231F] border-[#E4E5DF]'}`}>Gifts</button>
          </div>
        </motion.div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-[#777B75]">Koi transaction nahi mila</p>
          </div>
        ) : (
          <div className="bg-white border-t border-[#E4E5DF]">
            {transactions.map(tx => (
              <TxRow key={tx.id} tx={tx} onClick={() => onSelectTx(tx.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ REPORTS ============
function ReportsScreen() {
  const [period, setPeriod] = useState<'daily' | 'monthly'>('monthly');
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const navigateMonth = (dir: number) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const [year, month] = selectedMonth.split('-').map(Number);
  const monthStart = `${selectedMonth}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const monthEnd = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`;
  const monthLabel = new Date(year, month - 1).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });

  const startDate = period === 'daily' ? selectedDate : monthStart;
  const endDate = period === 'daily' ? selectedDate : monthEnd;

  const summary = db.calculatePeriodSummary(startDate, endDate);
  const breakdown = db.getCategoryBreakdown(startDate, endDate);
  const maxCat = breakdown.length > 0 ? breakdown[0].total : 1;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F7F3]">
      <NavBar title="Reports" />
      
      <div className="flex-1 overflow-y-auto">
        {/* Period Toggle */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex bg-[#EFEFE9] p-1">
            <button onClick={() => setPeriod('daily')} className={`flex-1 py-2.5 text-xs font-semibold ${period === 'daily' ? 'bg-white text-[#20231F]' : 'text-[#777B75]'}`}>Daily</button>
            <button onClick={() => setPeriod('monthly')} className={`flex-1 py-2.5 text-xs font-semibold ${period === 'monthly' ? 'bg-white text-[#20231F]' : 'text-[#777B75]'}`}>Monthly</button>
          </div>
        </div>

        {/* Date Selector */}
        <div className="px-4 pb-4">
          {period === 'daily' ? (
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-3 py-3 bg-white border border-[#E4E5DF] text-sm" />
          ) : (
            <div className="flex items-center justify-between bg-white border border-[#E4E5DF] px-4 py-3">
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => navigateMonth(-1)}>
                <ChevronLeft size={18} className="text-[#777B75]" />
              </motion.button>
              <span className="text-sm font-semibold text-[#20231F]">{monthLabel}</span>
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => navigateMonth(1)}>
                <ChevronRight size={18} className="text-[#777B75]" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Net Movement */}
        <div className="px-4 mb-4">
          <div className="bg-white border border-[#E4E5DF] p-4">
            <p className="text-xs text-[#777B75] uppercase tracking-wider mb-1">Net Movement</p>
            <p className={`text-2xl font-bold tabular-nums ${summary.net_movement >= 0 ? 'text-[#34764A]' : 'text-[#B84C43]'}`}>
              {summary.net_movement >= 0 ? '+' : ''}{formatCurrency(summary.net_movement)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Received" value={summary.money_received} color="text-[#34764A]" />
            <StatCard label="Earned" value={summary.earned_income} color="text-[#34764A]" />
            <StatCard label="Expenses" value={summary.total_expenses} color="text-[#B84C43]" />
            <StatCard label="Borrowed" value={summary.borrowed_funds} color="text-[#20231F]" />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="px-4 pb-24">
          <p className="text-xs font-medium text-[#777B75] uppercase tracking-wider mb-3">Expense Breakdown</p>
          {breakdown.length === 0 ? (
            <div className="bg-white border border-[#E4E5DF] p-6 text-center">
              <p className="text-sm text-[#777B75]">Koi expense nahi</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E4E5DF]">
              {breakdown.map(cat => (
                <div key={cat.category_id} className="px-4 py-3 border-b border-[#E4E5DF] last:border-b-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-[#20231F]">{cat.category_name}</span>
                    <span className="text-sm font-semibold tabular-nums text-[#20231F]">{formatCurrency(cat.total)}</span>
                  </div>
                  <div className="w-full h-1 bg-[#EFEFE9]">
                    <div className="h-full bg-[#B84C43] transition-all duration-700" style={{ width: `${(cat.total / maxCat) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ SETTINGS ============
function SettingsScreen({ navigate, showToast, onLock }: { navigate: (s: Screen) => void; showToast: (m: string, t?: 'success' | 'error') => void; onLock: () => void }) {
  const settings = db.getSettings();
  const [showReset, setShowReset] = useState(false);

  const handleExport = () => {
    const backup = db.exportBackup();
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `wallet-${getToday()}.json`; a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exported');
  };

  const handleCSV = () => {
    const csv = db.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `transactions-${getToday()}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = db.importBackup(ev.target?.result as string);
        showToast(result.success ? 'Restored!' : (result.error || 'Failed'), result.success ? 'success' : 'error');
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F7F3]">
      <NavBar title="Settings" />
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {/* Security */}
        <p className="text-xs font-medium text-[#777B75] uppercase tracking-wider mb-2 px-1">Security</p>
        <div className="bg-white border border-[#E4E5DF] mb-5">
          <SettingsRow icon={<Shield size={16} />} label="Change Password" onClick={() => navigate('change-password')} />
          <SettingsRow icon={<Lock size={16} />} label="PIN Setup" value={settings.pin_enabled ? 'On' : 'Off'} onClick={() => navigate('set-pin')} />
          <SettingsRow icon={<EyeOff size={16} />} label="Hide Balance" toggle value={settings.hide_balance} onClick={() => db.updateSettings({ hide_balance: !settings.hide_balance })} />
        </div>

        {/* Data */}
        <p className="text-xs font-medium text-[#777B75] uppercase tracking-wider mb-2 px-1">Data</p>
        <div className="bg-white border border-[#E4E5DF] mb-5">
          <SettingsRow icon={<Download size={16} />} label="Export Backup" onClick={handleExport} />
          <SettingsRow icon={<Download size={16} />} label="Export CSV" onClick={handleCSV} />
          <SettingsRow icon={<Upload size={16} />} label="Restore Backup" onClick={handleImport} />
          <SettingsRow icon={<Trash2 size={16} />} label="Reset All Data" danger onClick={() => setShowReset(true)} />
        </div>

        {/* Lock */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={onLock} className="w-full py-3.5 bg-white border border-[#E4E5DF] flex items-center justify-center gap-2 text-sm font-medium text-[#20231F]">
          <Lock size={14} /> Lock App
        </motion.button>
      </div>

      <AnimatePresence>
        {showReset && (
          <BottomSheet onClose={() => setShowReset(false)} title="Reset All Data">
            <p className="text-sm text-[#777B75] leading-relaxed mb-5">
              Saara data delete ho jayega - transactions, categories, debts, settings. Yeh wapas nahi aayega. Backup zaroor banayein.
            </p>
            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowReset(false)} className="flex-1 py-3.5 bg-[#EFEFE9] font-semibold text-sm">Cancel</motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => { db.resetAllData(); setShowReset(false); showToast('Data reset'); setTimeout(() => window.location.reload(), 800); }} className="flex-1 py-3.5 bg-[#B84C43] text-white font-semibold text-sm">Delete</motion.button>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ ADD MONEY ============
function AddMoneyScreen({ goBack, onSave }: { goBack: () => void; onSave: () => void }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('gift_allowance');
  const [date, setDate] = useState(getToday());
  const [person, setPerson] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const people = db.getPeople();
  const categories = db.getCategoriesByType('income');

  const types = [
    { value: 'earned_income', label: 'Earned Income' },
    { value: 'gift_allowance', label: 'Gift / Allowance' },
    { value: 'family_money', label: 'Family Money' },
    { value: 'person_money', label: 'From Person' },
    { value: 'borrowed_money', label: 'Borrowed' },
    { value: 'other_income', label: 'Other' },
  ];

  const handleSave = () => {
    const amt = parseAmountInput(amount);
    if (!amt) { setError('Amount enter karein'); return; }
    
    let personId: string | null = null;
    if (person.trim()) personId = db.getOrCreatePerson(person.trim()).id;

    let debtId: string | null = null;
    if (type === 'borrowed_money' && personId) {
      debtId = db.addDebt(personId, amt, date, null, notes).id;
    }

    db.addTransaction({
      transaction_type: type, amount: amt, currency_code: 'PKR',
      category_id: categoryId || null, related_person_id: personId,
      description: person.trim() || types.find(t => t.value === type)?.label || 'Money',
      notes, transaction_date: date, related_debt_id: debtId,
    });
    onSave();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F7F3]">
      <NavBar title="Add Money" onBack={goBack} />
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24">
        <NativeAmountInput value={amount} onChange={setAmount} error={error} />
        
        <div className="mt-5">
          <p className="text-xs font-medium text-[#777B75] uppercase tracking-wider mb-2">Type</p>
          <div className="flex flex-wrap gap-2">
            {types.map(t => (
              <motion.button key={t.value} whileTap={{ scale: 0.95 }} onClick={() => setType(t.value as TransactionType)}
                className={`px-3 py-2 text-xs font-medium border ${type === t.value ? 'bg-[#376B4B] text-white border-[#376B4B]' : 'bg-white text-[#20231F] border-[#E4E5DF]'}`}>
                {t.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <NativeDateInput value={date} onChange={setDate} label="Date" />
        </div>

        {['gift_allowance', 'family_money', 'person_money', 'borrowed_money'].includes(type) && (
          <div className="mt-5">
            <NativeInput label="Received From" value={person} onChange={setPerson} placeholder="Name" />
          </div>
        )}

        <div className="mt-5">
          <p className="text-xs font-medium text-[#777B75] uppercase tracking-wider mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <motion.button key={c.id} whileTap={{ scale: 0.95 }} onClick={() => setCategoryId(c.id)}
                className={`px-3 py-2 text-xs font-medium border ${categoryId === c.id ? 'bg-[#376B4B] text-white border-[#376B4B]' : 'bg-white text-[#20231F] border-[#E4E5DF]'}`}>
                {c.name}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <NativeInput label="Notes" value={notes} onChange={setNotes} placeholder="Optional" />
        </div>

        <div className="mt-6">
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} className="w-full py-4 bg-[#376B4B] text-white font-semibold">
            Save
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ============ ADD EXPENSE ============
function AddExpenseScreen({ goBack, onSave }: { goBack: () => void; onSave: () => void }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getToday());
  const [person, setPerson] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const people = db.getPeople();
  const categories = db.getCategoriesByType('expense');
  const balance = db.calculateBalance();

  const handleSave = () => {
    const amt = parseAmountInput(amount);
    if (!amt) { setError('Amount enter karein'); return; }
    if (!categoryId) { setError('Category select karein'); return; }
    if (amt > balance.current_balance) setWarning('Balance se zyada hai');
    
    let personId: string | null = null;
    if (person.trim()) personId = db.getOrCreatePerson(person.trim()).id;
    const cat = categories.find(c => c.id === categoryId);

    db.addTransaction({
      transaction_type: 'expense', amount: amt, currency_code: 'PKR',
      category_id: categoryId, related_person_id: personId,
      description: person.trim() || cat?.name || 'Expense',
      notes, transaction_date: date, related_debt_id: null,
    });
    onSave();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F7F3]">
      <NavBar title="Add Expense" onBack={goBack} />
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24">
        <NativeAmountInput value={amount} onChange={(v) => { setAmount(v); setWarning(''); }} error={error} />
        
        {warning && (
          <div className="mt-3 px-3 py-2 bg-[#B84C43]/10 border border-[#B84C43]/30">
            <p className="text-xs text-[#B84C43]">{warning}</p>
          </div>
        )}

        <div className="mt-5">
          <NativeDateInput value={date} onChange={setDate} label="Date" />
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium text-[#777B75] uppercase tracking-wider mb-2">Category *</p>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <motion.button key={c.id} whileTap={{ scale: 0.95 }} onClick={() => setCategoryId(c.id)}
                className={`px-3 py-2 text-xs font-medium border ${categoryId === c.id ? 'bg-[#376B4B] text-white border-[#376B4B]' : 'bg-white text-[#20231F] border-[#E4E5DF]'}`}>
                {c.name}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <NativeInput label="Paid To" value={person} onChange={setPerson} placeholder="Name (optional)" />
        </div>

        <div className="mt-5">
          <NativeInput label="Notes" value={notes} onChange={setNotes} placeholder="Optional" />
        </div>

        <div className="mt-6">
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} className="w-full py-4 bg-[#376B4B] text-white font-semibold">
            Save Expense
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ============ ADD BORROW ============
function AddBorrowScreen({ goBack, onSave }: { goBack: () => void; onSave: () => void }) {
  const [amount, setAmount] = useState('');
  const [person, setPerson] = useState('');
  const [date, setDate] = useState(getToday());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const amt = parseAmountInput(amount);
    if (!amt) { setError('Amount enter karein'); return; }
    if (!person.trim()) { setError('Lender ka naam likhein'); return; }
    
    const p = db.getOrCreatePerson(person.trim());
    const debt = db.addDebt(p.id, amt, date, null, notes);
    db.addTransaction({
      transaction_type: 'borrowed_money', amount: amt, currency_code: 'PKR',
      category_id: null, related_person_id: p.id,
      description: `Borrowed from ${person.trim()}`,
      notes, transaction_date: date, related_debt_id: debt.id,
    });
    onSave();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F7F3]">
      <NavBar title="Record Borrowing" onBack={goBack} />
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24">
        <NativeAmountInput value={amount} onChange={setAmount} error={error} />
        <div className="mt-5"><NativeInput label="Lender" value={person} onChange={setPerson} placeholder="Kis se udhaar liya?" /></div>
        <div className="mt-5"><NativeDateInput value={date} onChange={setDate} label="Date" /></div>
        <div className="mt-5"><NativeInput label="Notes" value={notes} onChange={setNotes} placeholder="Optional" /></div>
        <div className="mt-6">
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} className="w-full py-4 bg-[#376B4B] text-white font-semibold">Save</motion.button>
        </div>
      </div>
    </div>
  );
}

// ============ ADD REPAY ============
function AddRepayScreen({ goBack, onSave }: { goBack: () => void; onSave: () => void }) {
  const [debtId, setDebtId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getToday());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const debts = db.getDebts().filter(d => d.status === 'open');
  const people = db.getPeople();

  const handleSave = () => {
    const amt = parseAmountInput(amount);
    if (!amt) { setError('Amount enter karein'); return; }
    if (!debtId) { setError('Debt select karein'); return; }
    const remaining = db.getDebtRemaining(debtId);
    if (amt > remaining) { setError(`Remaining: ${formatCurrency(remaining)}`); return; }
    
    const debt = db.getDebtById(debtId)!;
    const person = people.find(p => p.id === debt.person_id);
    db.addDebtRepayment(debtId, amt, date, notes);
    db.addTransaction({
      transaction_type: 'repayment', amount: amt, currency_code: 'PKR',
      category_id: null, related_person_id: debt.person_id,
      description: `Repaid to ${person?.name || 'lender'}`,
      notes, transaction_date: date, related_debt_id: debtId,
    });
    onSave();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F7F3]">
      <NavBar title="Record Repayment" onBack={goBack} />
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24">
        {debts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-[#777B75]">Koi outstanding debt nahi</p>
          </div>
        ) : (
          <>
            <div>
              <p className="text-xs font-medium text-[#777B75] uppercase tracking-wider mb-2">Select Debt</p>
              <div className="space-y-2">
                {debts.map(d => {
                  const person = people.find(p => p.id === d.person_id);
                  const remaining = db.getDebtRemaining(d.id);
                  return (
                    <motion.button key={d.id} whileTap={{ scale: 0.98 }} onClick={() => setDebtId(d.id)}
                      className={`w-full p-3 border text-left ${debtId === d.id ? 'border-[#376B4B] bg-[#376B4B]/5' : 'border-[#E4E5DF] bg-white'}`}>
                      <p className="text-sm font-medium text-[#20231F]">{person?.name || 'Unknown'}</p>
                      <p className="text-xs text-[#777B75] mt-0.5">Remaining: {formatCurrency(remaining)}</p>
                    </motion.button>
                  );
                })}
              </div>
              {error && <p className="text-xs text-[#B84C43] mt-2">{error}</p>}
            </div>
            <div className="mt-5"><NativeAmountInput value={amount} onChange={setAmount} autoFocus={false} /></div>
            <div className="mt-5"><NativeDateInput value={date} onChange={setDate} label="Date" /></div>
            <div className="mt-5"><NativeInput label="Notes" value={notes} onChange={setNotes} placeholder="Optional" /></div>
            <div className="mt-6">
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} className="w-full py-4 bg-[#376B4B] text-white font-semibold">Save</motion.button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============ TX DETAIL ============
function TransactionDetailScreen({ txId, goBack, onEdit, onDelete }: { txId: string; goBack: () => void; onEdit: () => void; onDelete: () => void }) {
  const [showDelete, setShowDelete] = useState(false);
  const tx = db.getTransactionById(txId);
  if (!tx) return <div className="p-5"><p>Not found</p></div>;

  const people = db.getPeople();
  const categories = db.getCategories();
  const person = people.find(p => p.id === tx.related_person_id);
  const category = categories.find(c => c.id === tx.category_id);
  const isOut = tx.transaction_type === 'expense' || tx.transaction_type === 'repayment';

  const typeLabel = () => {
    const map: Record<string, string> = {
      earned_income: 'Earned Income', gift_allowance: 'Gift', family_money: 'Family',
      person_money: 'From Person', borrowed_money: 'Borrowed', expense: 'Expense',
      repayment: 'Repayment', other_income: 'Other Income', loan_repayment_received: 'Loan Repayment',
    };
    return map[tx.transaction_type] || 'Transaction';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F7F3]">
      <NavBar title="Details" onBack={goBack} />
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24">
        <div className="bg-white border border-[#E4E5DF] p-5 text-center mb-4">
          <p className="text-xs text-[#777B75] uppercase tracking-wider mb-2">{typeLabel()}</p>
          <p className={`text-3xl font-bold tabular-nums ${isOut ? 'text-[#B84C43]' : 'text-[#34764A]'}`}>
            {isOut ? '-' : '+'}{formatCurrency(tx.amount)}
          </p>
        </div>

        <div className="bg-white border border-[#E4E5DF]">
          <DetailRow label="Description" value={tx.description} />
          <DetailRow label="Date" value={new Date(tx.transaction_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })} />
          {category && <DetailRow label="Category" value={category.name} />}
          {person && <DetailRow label={isOut ? 'Paid To' : 'From'} value={person.name} />}
          {tx.notes && <DetailRow label="Notes" value={tx.notes} />}
        </div>

        <div className="mt-6 flex gap-3">
          <motion.button whileTap={{ scale: 0.97 }} onClick={onEdit} className="flex-1 py-3.5 bg-white border border-[#E4E5DF] font-semibold text-sm text-[#20231F]">Edit</motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowDelete(true)} className="flex-1 py-3.5 bg-[#B84C43] text-white font-semibold text-sm">Delete</motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showDelete && (
          <BottomSheet onClose={() => setShowDelete(false)} title="Delete?">
            <p className="text-sm text-[#777B75] mb-5">Yeh transaction permanently delete ho jayegi.</p>
            <div className="flex gap-3">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowDelete(false)} className="flex-1 py-3.5 bg-[#EFEFE9] font-semibold text-sm">Cancel</motion.button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => { db.deleteTransaction(txId); setShowDelete(false); onDelete(); }} className="flex-1 py-3.5 bg-[#B84C43] text-white font-semibold text-sm">Delete</motion.button>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ EDIT TX ============
function EditTransactionScreen({ txId, goBack, onSave }: { txId: string; goBack: () => void; onSave: () => void }) {
  const tx = db.getTransactionById(txId);
  const [amount, setAmount] = useState(tx ? (tx.amount / 100).toFixed(2) : '');
  const [date, setDate] = useState(tx?.transaction_date || getToday());
  const [description, setDescription] = useState(tx?.description || '');
  const [notes, setNotes] = useState(tx?.notes || '');
  const [categoryId, setCategoryId] = useState(tx?.category_id || '');
  const [error, setError] = useState('');
  if (!tx) return null;

  const isExpense = tx.transaction_type === 'expense';
  const categories = db.getCategoriesByType(isExpense ? 'expense' : 'income');

  const handleSave = () => {
    const amt = parseAmountInput(amount);
    if (!amt) { setError('Amount enter karein'); return; }
    db.updateTransaction(txId, { amount: amt, transaction_date: date, description, notes, category_id: categoryId || null });
    onSave();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F7F3]">
      <NavBar title="Edit" onBack={goBack} />
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24">
        <NativeAmountInput value={amount} onChange={setAmount} error={error} autoFocus={false} />
        <div className="mt-5"><NativeInput label="Description" value={description} onChange={setDescription} /></div>
        <div className="mt-5"><NativeDateInput value={date} onChange={setDate} label="Date" /></div>
        <div className="mt-5">
          <p className="text-xs font-medium text-[#777B75] uppercase tracking-wider mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <motion.button key={c.id} whileTap={{ scale: 0.95 }} onClick={() => setCategoryId(c.id)}
                className={`px-3 py-2 text-xs font-medium border ${categoryId === c.id ? 'bg-[#376B4B] text-white border-[#376B4B]' : 'bg-white text-[#20231F] border-[#E4E5DF]'}`}>
                {c.name}
              </motion.button>
            ))}
          </div>
        </div>
        <div className="mt-5"><NativeInput label="Notes" value={notes} onChange={setNotes} /></div>
        <div className="mt-6">
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} className="w-full py-4 bg-[#376B4B] text-white font-semibold">Update</motion.button>
        </div>
      </div>
    </div>
  );
}

// ============ CHANGE PASSWORD ============
function ChangePasswordScreen({ goBack, showToast }: { goBack: () => void; showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    const auth = db.getAuth();
    const valid = await verifyPassword(current, auth.password_hash, auth.salt);
    if (!valid) { setError('Current password galat hai'); return; }
    const err = validatePassword(newPass);
    if (err) { setError(err); return; }
    if (newPass !== confirm) { setError('Passwords match nahi'); return; }
    const { hash, salt } = await createPasswordHash(newPass);
    db.saveAuth({ password_hash: hash, salt, is_setup: true });
    showToast('Password changed');
    goBack();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F7F3]">
      <NavBar title="Change Password" onBack={goBack} />
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24">
        <NativeInput label="Current Password" type="password" value={current} onChange={setCurrent} />
        <div className="mt-4"><NativeInput label="New Password" type="password" value={newPass} onChange={setNewPass} placeholder="Min 8 chars" /></div>
        <div className="mt-4"><NativeInput label="Confirm" type="password" value={confirm} onChange={setConfirm} error={error} /></div>
        <div className="mt-6"><motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} className="w-full py-4 bg-[#376B4B] text-white font-semibold">Update</motion.button></div>
      </div>
    </div>
  );
}

// ============ SET PIN ============
function SetPinScreen({ goBack, showToast }: { goBack: () => void; showToast: (m: string, t?: 'success' | 'error') => void }) {
  const settings = db.getSettings();
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const err = validatePin(pin);
    if (err) { setError(err); return; }
    if (pin !== confirm) { setError('PINs match nahi'); return; }
    db.updateSettings({ pin_enabled: true, pin });
    showToast('PIN set');
    goBack();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F7F7F3]">
      <NavBar title="PIN Setup" onBack={goBack} />
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-24">
        {settings.pin_enabled && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => { db.updateSettings({ pin_enabled: false, pin: null }); showToast('PIN disabled'); goBack(); }}
            className="w-full py-3.5 bg-[#B84C43] text-white font-semibold text-sm mb-5">Disable PIN</motion.button>
        )}
        <NativeInput label="New PIN" type="password" value={pin} onChange={(v) => { if (v.length <= 6) setPin(v); }} inputMode="numeric" placeholder="4 or 6 digits" />
        <div className="mt-4"><NativeInput label="Confirm PIN" type="password" value={confirm} onChange={(v) => { if (v.length <= 6) setConfirm(v); }} inputMode="numeric" error={error} /></div>
        <div className="mt-6"><motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} className="w-full py-4 bg-[#376B4B] text-white font-semibold">Save PIN</motion.button></div>
      </div>
    </div>
  );
}

// ============ REUSABLE NATIVE COMPONENTS ============
function NativeInput({ label, value, onChange, type = 'text', placeholder, error, inputMode, autoFocus }: {
  label?: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; error?: string; inputMode?: 'text' | 'numeric'; autoFocus?: boolean;
}) {
  return (
    <div>
      {label && <label className="block text-xs font-medium text-[#777B75] mb-1.5 uppercase tracking-wider">{label}</label>}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} inputMode={inputMode} autoFocus={autoFocus}
        className={`w-full px-4 py-3.5 bg-white border text-[#20231F] placeholder-[#777B75]/40 focus:outline-none focus:border-[#376B4B] transition-colors ${error ? 'border-[#B84C43]' : 'border-[#E4E5DF]'}`} />
      {error && <p className="text-xs text-[#B84C43] mt-1.5">{error}</p>}
    </div>
  );
}

function NativeAmountInput({ value, onChange, error, autoFocus = true }: { value: string; onChange: (v: string) => void; error?: string; autoFocus?: boolean }) {
  const handleChange = (val: string) => {
    let c = val.replace(/[^0-9.]/g, '');
    const parts = c.split('.');
    if (parts.length > 2) c = parts[0] + '.' + parts.slice(1).join('');
    if (parts.length === 2 && parts[1].length > 2) c = parts[0] + '.' + parts[1].slice(0, 2);
    onChange(c);
  };
  return (
    <div>
      <label className="block text-xs font-medium text-[#777B75] mb-1.5 uppercase tracking-wider">Amount *</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#777B75] font-medium">Rs.</span>
        <input type="text" inputMode="decimal" value={value} onChange={(e) => handleChange(e.target.value)} placeholder="0.00" autoFocus={autoFocus}
          className={`w-full pl-14 pr-4 py-4 bg-white border text-2xl font-bold tabular-nums text-[#20231F] placeholder-[#777B75]/20 focus:outline-none focus:border-[#376B4B] ${error ? 'border-[#B84C43]' : 'border-[#E4E5DF]'}`} />
      </div>
      {error && <p className="text-xs text-[#B84C43] mt-1.5">{error}</p>}
    </div>
  );
}

function NativeDateInput({ value, onChange, label = 'Date' }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#777B75] mb-1.5 uppercase tracking-wider">{label}</label>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-3.5 bg-white border border-[#E4E5DF] text-[#20231F] focus:outline-none focus:border-[#376B4B]" />
    </div>
  );
}

function TxRow({ tx, onClick }: { tx: { id: string; transaction_type: string; amount: number; description: string; transaction_date: string }; onClick: () => void }) {
  const isOut = tx.transaction_type === 'expense' || tx.transaction_type === 'repayment';
  const label = () => {
    const m: Record<string, string> = {
      earned_income: 'Earned', gift_allowance: 'Gift', family_money: 'Family',
      person_money: 'Received', borrowed_money: 'Borrowed', expense: 'Expense',
      repayment: 'Repaid', other_income: 'Other', loan_repayment_received: 'Loan Repaid',
    };
    return m[tx.transaction_type] || 'Tx';
  };

  return (
    <motion.button whileTap={{ scale: 0.99, backgroundColor: '#EFEFE9' }} onClick={onClick}
      className="w-full flex items-center px-4 py-3.5 border-b border-[#E4E5DF] text-left">
      <div className={`w-9 h-9 flex items-center justify-center mr-3 flex-shrink-0 ${isOut ? 'bg-[#B84C43]/10' : 'bg-[#34764A]/10'}`}>
        {isOut ? <TrendingDown size={14} className="text-[#B84C43]" /> : <TrendingUp size={14} className="text-[#34764A]" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#20231F] truncate">{tx.description || label()}</p>
        <p className="text-[11px] text-[#777B75] mt-0.5">{label()} · {new Date(tx.transaction_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</p>
      </div>
      <p className={`text-sm font-semibold tabular-nums ml-2 ${isOut ? 'text-[#B84C43]' : 'text-[#34764A]'}`}>
        {isOut ? '-' : '+'}Rs. {(tx.amount / 100).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
      </p>
    </motion.button>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-[#E4E5DF] p-3.5">
      <p className="text-[10px] text-[#777B75] uppercase tracking-wider font-medium mb-1">{label}</p>
      <p className={`text-base font-bold tabular-nums ${color}`}>Rs. {(value / 100).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 border-b border-[#E4E5DF] last:border-b-0">
      <p className="text-[10px] text-[#777B75] uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-[#20231F] font-medium">{value}</p>
    </div>
  );
}

function SettingsRow({ icon, label, value, onClick, toggle, danger }: { icon: React.ReactNode; label: string; value?: string | boolean; onClick: () => void; toggle?: boolean; danger?: boolean }) {
  return (
    <motion.button whileTap={{ scale: 0.99, backgroundColor: '#EFEFE9' }} onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3.5 border-b border-[#E4E5DF] last:border-b-0 text-left">
      <div className="flex items-center gap-3">
        <span className={danger ? 'text-[#B84C43]' : 'text-[#777B75]'}>{icon}</span>
        <span className={`text-sm font-medium ${danger ? 'text-[#B84C43]' : 'text-[#20231F]'}`}>{label}</span>
      </div>
      {toggle ? (
        <div className={`w-11 h-6 relative ${value ? 'bg-[#376B4B]' : 'bg-[#E4E5DF]'} transition-colors`}>
          <div className={`absolute top-[3px] w-5 h-5 bg-white transition-transform ${value ? 'translate-x-[22px]' : 'translate-x-[3px]'}`} />
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {value !== undefined && typeof value === 'string' && <span className="text-xs text-[#777B75]">{value}</span>}
          <ChevronRight size={16} className="text-[#777B75]" />
        </div>
      )}
    </motion.button>
  );
}

function BottomSheet({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 z-50" />
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-[#F7F7F3] border-t border-[#E4E5DF] z-50 max-w-md mx-auto pb-[env(safe-area-inset-bottom)]">
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#20231F]">{title}</h3>
            <motion.button whileTap={{ scale: 0.85 }} onClick={onClose}><X size={20} className="text-[#777B75]" /></motion.button>
          </div>
          {children}
        </div>
      </motion.div>
    </>
  );
}
