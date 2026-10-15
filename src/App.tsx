import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as db from './db/database';
import { createPasswordHash, verifyPassword, validatePassword, validatePin } from './utils/auth';
import { formatCurrency, parseAmountInput } from './utils/currency';
import { getCurrentGreeting, getCurrentDateFormatted, getToday } from './utils/date';
import { Button, Input, AmountInput, Select, TextArea, Modal, ConfirmDialog, Toast, EmptyState, CategoryChips, PersonInput, DateInput, TransactionRow, SummaryCard } from './components/ui';
import type { TransactionType } from './types';
import {
  Home, List, PieChart, Settings as SettingsIcon, Plus, ArrowLeft, Search,
  Lock, Eye, EyeOff, Download, Upload, Trash2, ChevronRight,
  Wallet, TrendingUp, TrendingDown, CreditCard, Shield, Filter
} from 'lucide-react';

type Screen = 'welcome' | 'setup' | 'lock' | 'dashboard' | 'transactions' | 'reports' | 'settings' | 'add-money' | 'add-expense' | 'add-borrow' | 'add-repay' | 'transaction-detail' | 'edit-transaction' | 'change-password' | 'set-pin' | 'export' | 'import';

export default function App() {
  const [screen, setScreen] = useState<Screen>('lock');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [previousScreen, setPreviousScreen] = useState<Screen>('dashboard');
  
  const refresh = () => setRefreshKey(k => k + 1);
  
  const navigateTo = (s: Screen) => {
    setPreviousScreen(screen as Screen);
    setScreen(s);
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
  
  if (loading) {
    return (
      <div className="h-full w-full bg-[#F7F7F3] flex items-center justify-center max-w-lg mx-auto">
        <div className="w-8 h-8 border-2 border-[#376B4B] border-t-transparent animate-spin" />
      </div>
    );
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // ============ AUTH SCREENS ============
  if (screen === 'welcome') return <WelcomeScreen onComplete={() => setScreen('setup')} />;
  if (screen === 'setup') return <SetupScreen onComplete={() => { setIsAuthenticated(true); setScreen('dashboard'); }} showToast={showToast} />;
  if (screen === 'lock' && !isAuthenticated) return <LockScreen onUnlock={() => { setIsAuthenticated(true); setScreen('dashboard'); }} showToast={showToast} />;

  // ============ MAIN APP ============
  return (
    <div className="h-full w-full bg-[#F7F7F3] flex flex-col overflow-hidden max-w-lg mx-auto relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex-1 overflow-y-auto overflow-x-hidden"
        >
          {screen === 'dashboard' && (
            <DashboardScreen 
              onNavigate={navigateTo} 
              refreshKey={refreshKey}
              onSelectTx={(id) => { setSelectedTxId(id); setPreviousScreen('dashboard'); setScreen('transaction-detail'); }}
            />
          )}
          {screen === 'transactions' && (
            <TransactionsScreen 
              onNavigate={navigateTo}
              refreshKey={refreshKey}
              onSelectTx={(id) => { setSelectedTxId(id); setPreviousScreen('transactions'); setScreen('transaction-detail'); }}
            />
          )}
          {screen === 'reports' && <ReportsScreen refreshKey={refreshKey} />}
          {screen === 'settings' && (
            <SettingsScreen 
              onNavigate={setScreen} 
              showToast={showToast}
              onLock={() => { setIsAuthenticated(false); setScreen('lock'); }}
            />
          )}
          {screen === 'add-money' && (
            <AddMoneyScreen 
              onBack={() => setScreen('dashboard')} 
              onSave={() => { refresh(); setScreen('dashboard'); showToast('Money added successfully'); }}
            />
          )}
          {screen === 'add-expense' && (
            <AddExpenseScreen 
              onBack={() => setScreen('dashboard')} 
              onSave={() => { refresh(); setScreen('dashboard'); showToast('Expense recorded'); }}
            />
          )}
          {screen === 'add-borrow' && (
            <AddBorrowScreen 
              onBack={() => setScreen('dashboard')} 
              onSave={() => { refresh(); setScreen('dashboard'); showToast('Borrowing recorded'); }}
            />
          )}
          {screen === 'add-repay' && (
            <AddRepayScreen 
              onBack={() => setScreen('dashboard')} 
              onSave={() => { refresh(); setScreen('dashboard'); showToast('Repayment recorded'); }}
            />
          )}
          {screen === 'transaction-detail' && selectedTxId && (
            <TransactionDetailScreen 
              txId={selectedTxId}
              onBack={() => setScreen(previousScreen === 'dashboard' ? 'dashboard' : 'transactions')}
              onEdit={() => setScreen('edit-transaction')}
              onDelete={() => { refresh(); setScreen(previousScreen === 'dashboard' ? 'dashboard' : 'transactions'); showToast('Transaction deleted'); }}
              showToast={showToast}
            />
          )}
          {screen === 'edit-transaction' && selectedTxId && (
            <EditTransactionScreen 
              txId={selectedTxId}
              onBack={() => setScreen('transaction-detail')}
              onSave={() => { refresh(); setScreen('transaction-detail'); showToast('Transaction updated'); }}
            />
          )}
          {screen === 'change-password' && (
            <ChangePasswordScreen onBack={() => setScreen('settings')} showToast={showToast} />
          )}
          {screen === 'set-pin' && (
            <SetPinScreen onBack={() => setScreen('settings')} showToast={showToast} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation */}
      {['dashboard', 'transactions', 'reports', 'settings'].includes(screen) && (
        <BottomNav current={screen} onNavigate={setScreen} />
      )}

      {/* FAB */}
      {screen === 'dashboard' && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setScreen('add-money')}
          className="absolute bottom-20 right-4 w-14 h-14 bg-[#376B4B] text-white flex items-center justify-center shadow-lg z-30 active:scale-95 transition-transform"
        >
          <Plus size={24} />
        </motion.button>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ BOTTOM NAV ============
function BottomNav({ current, onNavigate }: { current: string; onNavigate: (s: Screen) => void }) {
  const items = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'transactions', icon: List, label: 'History' },
    { id: 'reports', icon: PieChart, label: 'Reports' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="bg-white border-t border-[#E4E5DF] flex items-center justify-around py-2 safe-bottom">
      {items.map(item => {
        const isActive = current === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as Screen)}
            className="flex flex-col items-center py-1 px-3 min-w-[60px]"
          >
            <item.icon size={20} className={isActive ? 'text-[#376B4B]' : 'text-[#777B75]'} />
            <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-[#376B4B]' : 'text-[#777B75]'}`}>
              {item.label}
            </span>
            {isActive && (
              <motion.div layoutId="nav-indicator" className="w-4 h-0.5 bg-[#376B4B] mt-1" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ============ WELCOME SCREEN ============
function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="h-full w-full bg-[#F7F7F3] flex flex-col items-center justify-center px-8 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="w-16 h-16 bg-[#376B4B] flex items-center justify-center mx-auto mb-6">
          <Wallet size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#20231F] mb-2">Personal Wallet Manager</h1>
        <p className="text-sm text-[#777B75] leading-relaxed mb-8">
          Track your money, expenses, borrowings, and stay in control of your finances. All data stays on your device.
        </p>
        <Button onClick={onComplete} fullWidth>Get Started</Button>
      </motion.div>
    </div>
  );
}

// ============ SETUP SCREEN ============
function SetupScreen({ onComplete, showToast }: { onComplete: () => void; showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [step, setStep] = useState<'password' | 'confirm' | 'opening'>('password');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordSubmit = () => {
    const err = validatePassword(password);
    if (err) { setError(err); return; }
    setError('');
    setStep('confirm');
  };

  const handleConfirmSubmit = () => {
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setError('');
    setStep('opening');
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { hash, salt } = await createPasswordHash(password);
      db.saveAuth({ password_hash: hash, salt, is_setup: true });
      
      const openingAmount = parseAmountInput(openingBalance) || 0;
      db.updateSettings({ is_initialized: true, opening_balance: openingAmount, opening_balance_date: getToday() });
      
      showToast('Setup complete');
      onComplete();
    } catch (e) {
      showToast('Setup failed', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="h-full w-full bg-[#F7F7F3] flex flex-col justify-center px-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <h2 className="text-xl font-bold text-[#20231F] mb-1">
          {step === 'password' && 'Create Password'}
          {step === 'confirm' && 'Confirm Password'}
          {step === 'opening' && 'Opening Balance'}
        </h2>
        <p className="text-sm text-[#777B75] mb-6">
          {step === 'password' && 'Set a password to protect your financial data.'}
          {step === 'confirm' && 'Enter your password again to confirm.'}
          {step === 'opening' && 'Enter your current balance, or skip to start from zero.'}
        </p>

        {step === 'password' && (
          <>
            <Input label="Password" type="password" value={password} onChange={setPassword} error={error} placeholder="Min 8 characters" />
            <div className="mt-4">
              <Button onClick={handlePasswordSubmit} fullWidth>Continue</Button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <Input label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} error={error} placeholder="Re-enter password" />
            <div className="mt-4 flex gap-3">
              <Button variant="secondary" onClick={() => { setStep('password'); setError(''); }} fullWidth>Back</Button>
              <Button onClick={handleConfirmSubmit} fullWidth>Continue</Button>
            </div>
          </>
        )}

        {step === 'opening' && (
          <>
            <AmountInput value={openingBalance} onChange={setOpeningBalance} autoFocus={false} />
            <div className="mt-4 flex gap-3">
              <Button variant="secondary" onClick={() => setStep('confirm')} fullWidth>Back</Button>
              <Button onClick={handleComplete} disabled={loading} fullWidth>{loading ? 'Setting up...' : 'Finish'}</Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ============ LOCK SCREEN ============
function LockScreen({ onUnlock, showToast }: { onUnlock: () => void; showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [usePin, setUsePin] = useState(false);
  const [pin, setPin] = useState('');
  const settings = db.getSettings();
  const auth = db.getAuth();

  const handleUnlock = async () => {
    if (usePin && settings.pin_enabled && settings.pin) {
      if (pin === settings.pin) {
        onUnlock();
      } else {
        setError('Incorrect PIN');
        setPin('');
      }
      return;
    }
    
    const valid = await verifyPassword(password, auth.password_hash, auth.salt);
    if (valid) {
      onUnlock();
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="h-full w-full bg-[#F7F7F3] flex flex-col items-center justify-center px-6 max-w-lg mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center">
        <div className="w-14 h-14 bg-[#376B4B] flex items-center justify-center mx-auto mb-6">
          <Lock size={24} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-[#20231F] mb-1">Wallet Locked</h2>
        <p className="text-sm text-[#777B75] mb-8">Enter your {usePin ? 'PIN' : 'password'} to unlock</p>

        {usePin && settings.pin_enabled ? (
          <>
            <Input
              type="password"
              value={pin}
              onChange={(v) => { if (v.length <= 6) setPin(v); }}
              error={error}
              placeholder="Enter PIN"
              inputMode="numeric"
              autoFocus
            />
          </>
        ) : (
          <Input
            type="password"
            value={password}
            onChange={setPassword}
            error={error}
            placeholder="Enter password"
            autoFocus
          />
        )}

        <div className="mt-4">
          <Button onClick={handleUnlock} fullWidth>Unlock</Button>
        </div>

        {settings.pin_enabled && (
          <button
            onClick={() => { setUsePin(!usePin); setError(''); }}
            className="mt-4 text-xs text-[#777B75] underline"
          >
            {usePin ? 'Use password instead' : 'Use PIN instead'}
          </button>
        )}
      </motion.div>
    </div>
  );
}

// ============ DASHBOARD ============
function DashboardScreen({ onNavigate, refreshKey, onSelectTx }: { onNavigate: (s: Screen) => void; refreshKey: number; onSelectTx: (id: string) => void }) {
  const balance = db.calculateBalance();
  const settings = db.getSettings();
  const transactions = db.getTransactions().slice(0, 8);
  const [hideBalance, setHideBalance] = useState(settings.hide_balance);

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-[#777B75]">{getCurrentGreeting()}</p>
          <button onClick={() => onNavigate('settings')} className="p-1">
            <SettingsIcon size={18} className="text-[#777B75]" />
          </button>
        </div>
        <p className="text-xs text-[#777B75]">{getCurrentDateFormatted()}</p>
      </div>

      {/* Balance Card */}
      <div className="px-5 mb-6">
        <div className="bg-white border border-[#E4E5DF] p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-[#777B75] uppercase tracking-wide">Current Balance</p>
            <button onClick={() => setHideBalance(!hideBalance)} className="text-[#777B75]">
              {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <motion.p 
            key={hideBalance ? 'hidden' : balance.current_balance}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold tabular-nums text-[#20231F]"
          >
            {hideBalance ? 'Rs. ••••••' : formatCurrency(balance.current_balance)}
          </motion.p>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard label="Income" amount={balance.total_income} color="income" />
          <SummaryCard label="Expenses" amount={balance.total_expenses} color="expense" />
          <SummaryCard label="Borrowed" amount={balance.total_borrowed} color="default" />
          <SummaryCard label="Outstanding" amount={balance.outstanding_debt} color="expense" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mb-6">
        <h3 className="text-xs font-medium text-[#777B75] uppercase tracking-wide mb-3">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Add Money', icon: TrendingUp, action: () => onNavigate('add-money') },
            { label: 'Expense', icon: TrendingDown, action: () => onNavigate('add-expense') },
            { label: 'Borrow', icon: CreditCard, action: () => onNavigate('add-borrow') },
            { label: 'Repay', icon: Wallet, action: () => onNavigate('add-repay') },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex flex-col items-center py-3 bg-white border border-[#E4E5DF] active:bg-[#EFEFE9] transition-colors"
            >
              <item.icon size={18} className="text-[#376B4B] mb-1.5" />
              <span className="text-[10px] text-[#20231F] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Outstanding Debts */}
      {balance.outstanding_debt > 0 && (
        <div className="px-5 mb-6">
          <div className="bg-white border border-[#E4E5DF] p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#777B75] uppercase tracking-wide">Outstanding Debt</p>
              <button onClick={() => onNavigate('add-repay')} className="text-xs text-[#376B4B] font-medium">
                Repay
              </button>
            </div>
            <p className="text-xl font-bold tabular-nums text-[#B84C43]">
              {formatCurrency(balance.outstanding_debt)}
            </p>
            <p className="text-xs text-[#777B75] mt-1">
              Borrowed: {formatCurrency(balance.total_borrowed)} | Repaid: {formatCurrency(balance.total_repaid)}
            </p>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-[#777B75] uppercase tracking-wide">Recent</h3>
          {transactions.length > 0 && (
            <button onClick={() => onNavigate('transactions')} className="text-xs text-[#376B4B] font-medium">
              View All
            </button>
          )}
        </div>
        
        {transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            subtitle="Add your first transaction to get started"
            action={<Button onClick={() => onNavigate('add-money')}>Add Money</Button>}
          />
        ) : (
          <div className="bg-white border border-[#E4E5DF]">
            {transactions.map(tx => (
              <TransactionRow key={tx.id} transaction={tx} onClick={() => onSelectTx(tx.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ TRANSACTIONS SCREEN ============
function TransactionsScreen({ onNavigate, refreshKey, onSelectTx }: { onNavigate: (s: Screen) => void; refreshKey: number; onSelectTx: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const categories = db.getCategories();
  const transactions = db.searchTransactions(query, {
    type: (filterType as TransactionType) || undefined,
    category_id: filterCategory || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  });

  const hasFilters = filterType || filterCategory || startDate || endDate;

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-[#20231F] mb-4">Transactions</h1>
        
        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777B75]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#E4E5DF] text-sm focus:outline-none focus:border-[#376B4B]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2.5 border ${hasFilters ? 'bg-[#376B4B] border-[#376B4B] text-white' : 'bg-white border-[#E4E5DF] text-[#777B75]'}`}
          >
            <Filter size={16} />
          </button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-3 overflow-hidden"
            >
              <Select
                label="Type"
                value={filterType}
                onChange={setFilterType}
                placeholder="All types"
                options={[
                  { value: 'earned_income', label: 'Earned Income' },
                  { value: 'gift_allowance', label: 'Gift / Allowance' },
                  { value: 'family_money', label: 'Family Money' },
                  { value: 'person_money', label: 'Received from Person' },
                  { value: 'borrowed_money', label: 'Borrowed' },
                  { value: 'expense', label: 'Expense' },
                  { value: 'repayment', label: 'Repayment' },
                ]}
              />
              <Select
                label="Category"
                value={filterCategory}
                onChange={setFilterCategory}
                placeholder="All categories"
                options={categories.map(c => ({ value: c.id, label: c.name }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <DateInput label="From" value={startDate} onChange={setStartDate} />
                <DateInput label="To" value={endDate} onChange={setEndDate} />
              </div>
              {hasFilters && (
                <button
                  onClick={() => { setFilterType(''); setFilterCategory(''); setStartDate(''); setEndDate(''); }}
                  className="text-xs text-[#B84C43] font-medium"
                >
                  Clear all filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <EmptyState title="No transactions found" subtitle={query || hasFilters ? 'Try adjusting your search or filters' : 'Start by adding a transaction'} />
      ) : (
        <div className="bg-white border-t border-[#E4E5DF]">
          {transactions.map(tx => (
            <TransactionRow key={tx.id} transaction={tx} onClick={() => onSelectTx(tx.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============ REPORTS SCREEN ============
function ReportsScreen({ refreshKey }: { refreshKey: number }) {
  const [period, setPeriod] = useState<'daily' | 'monthly' | 'custom'>('monthly');
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
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
  
  let startDate: string, endDate: string;
  if (period === 'daily') {
    startDate = selectedDate;
    endDate = selectedDate;
  } else if (period === 'monthly') {
    startDate = monthStart;
    endDate = monthEnd;
  } else {
    startDate = customStart || monthStart;
    endDate = customEnd || monthEnd;
  }

  const summary = db.calculatePeriodSummary(startDate, endDate);
  const categoryBreakdown = db.getCategoryBreakdown(startDate, endDate);
  const balance = db.calculateBalance();
  const maxCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0].total : 1;

  return (
    <div className="pb-20">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-[#20231F] mb-4">Reports</h1>
        
        {/* Period Selector */}
        <div className="flex gap-1 bg-[#EFEFE9] p-1 mb-4">
          {(['daily', 'monthly', 'custom'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${
                period === p ? 'bg-white text-[#20231F]' : 'text-[#777B75]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {period === 'daily' && (
          <DateInput value={selectedDate} onChange={setSelectedDate} />
        )}
        {period === 'monthly' && (
          <div className="flex items-center justify-between bg-white border border-[#E4E5DF] px-4 py-3">
            <button onClick={() => navigateMonth(-1)} className="p-1 text-[#777B75] active:opacity-50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="text-sm font-medium text-[#20231F]">{monthLabel}</span>
            <button onClick={() => navigateMonth(1)} className="p-1 text-[#777B75] active:opacity-50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        )}
        {period === 'custom' && (
          <div className="grid grid-cols-2 gap-2">
            <DateInput label="From" value={customStart} onChange={setCustomStart} />
            <DateInput label="To" value={customEnd} onChange={setCustomEnd} />
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="px-5 mb-4">
        <div className="bg-white border border-[#E4E5DF] p-4 mb-3">
          <p className="text-xs text-[#777B75] uppercase tracking-wide mb-1">Net Movement</p>
          <p className={`text-2xl font-bold tabular-nums ${summary.net_movement >= 0 ? 'text-[#34764A]' : 'text-[#B84C43]'}`}>
            {summary.net_movement >= 0 ? '+' : ''}{formatCurrency(summary.net_movement)}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard label="Money Received" amount={summary.money_received} color="income" />
          <SummaryCard label="Earned Income" amount={summary.earned_income} color="income" />
          <SummaryCard label="Expenses" amount={summary.total_expenses} color="expense" />
          <SummaryCard label="Borrowed" amount={summary.borrowed_funds} color="default" />
          <SummaryCard label="Repaid" amount={summary.repayments_made} color="expense" />
          <SummaryCard label="Total Balance" amount={balance.current_balance} color="default" />
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="px-5">
        <h3 className="text-xs font-medium text-[#777B75] uppercase tracking-wide mb-3">Expense Breakdown</h3>
        {categoryBreakdown.length === 0 ? (
          <p className="text-sm text-[#777B75] py-4">No expenses in this period</p>
        ) : (
          <div className="bg-white border border-[#E4E5DF]">
            {categoryBreakdown.map((cat, idx) => (
              <div key={cat.category_id} className="px-4 py-3 border-b border-[#E4E5DF] last:border-b-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-[#20231F]">{cat.category_name}</span>
                  <span className="text-sm font-semibold tabular-nums text-[#20231F]">
                    {formatCurrency(cat.total)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#EFEFE9]">
                  <div
                    className="h-full bg-[#B84C43] transition-all duration-500"
                    style={{ width: `${(cat.total / maxCategory) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#777B75] mt-1">{cat.count} transaction{cat.count > 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ SETTINGS SCREEN ============
function SettingsScreen({ onNavigate, showToast, onLock }: { onNavigate: (s: Screen) => void; showToast: (m: string, t?: 'success' | 'error') => void; onLock: () => void }) {
  const settings = db.getSettings();
  const [showReset, setShowReset] = useState(false);

  const handleExport = () => {
    const backup = db.exportBackup();
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-backup-${getToday()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exported');
  };

  const handleExportCSV = () => {
    const csv = db.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${getToday()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = db.importBackup(ev.target?.result as string);
        if (result.success) {
          showToast('Backup restored successfully');
        } else {
          showToast(result.error || 'Failed to restore', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    db.resetAllData();
    showToast('All data has been reset');
    setTimeout(() => window.location.reload(), 1000);
  };

  const toggleHideBalance = () => {
    db.updateSettings({ hide_balance: !settings.hide_balance });
  };

  return (
    <div className="pb-20">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-[#20231F]">Settings</h1>
      </div>

      <div className="px-5 space-y-6">
        {/* Security */}
        <div>
          <h3 className="text-xs font-medium text-[#777B75] uppercase tracking-wide mb-3">Security</h3>
          <div className="bg-white border border-[#E4E5DF]">
            <button onClick={() => onNavigate('change-password')} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-[#E4E5DF] active:bg-[#EFEFE9]">
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-[#777B75]" />
                <span className="text-sm text-[#20231F]">Change Password</span>
              </div>
              <ChevronRight size={16} className="text-[#777B75]" />
            </button>
            <button onClick={() => onNavigate('set-pin')} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-[#E4E5DF] active:bg-[#EFEFE9]">
              <div className="flex items-center gap-3">
                <Lock size={16} className="text-[#777B75]" />
                <span className="text-sm text-[#20231F]">PIN Setup</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#777B75]">{settings.pin_enabled ? 'On' : 'Off'}</span>
                <ChevronRight size={16} className="text-[#777B75]" />
              </div>
            </button>
            <button onClick={toggleHideBalance} className="w-full flex items-center justify-between px-4 py-3.5 active:bg-[#EFEFE9]">
              <div className="flex items-center gap-3">
                <EyeOff size={16} className="text-[#777B75]" />
                <span className="text-sm text-[#20231F]">Hide Balance</span>
              </div>
              <div className={`w-10 h-5 relative transition-colors ${settings.hide_balance ? 'bg-[#376B4B]' : 'bg-[#E4E5DF]'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white transition-transform ${settings.hide_balance ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Data */}
        <div>
          <h3 className="text-xs font-medium text-[#777B75] uppercase tracking-wide mb-3">Data</h3>
          <div className="bg-white border border-[#E4E5DF]">
            <button onClick={handleExport} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-[#E4E5DF] active:bg-[#EFEFE9]">
              <div className="flex items-center gap-3">
                <Download size={16} className="text-[#777B75]" />
                <span className="text-sm text-[#20231F]">Export Backup (JSON)</span>
              </div>
              <ChevronRight size={16} className="text-[#777B75]" />
            </button>
            <button onClick={handleExportCSV} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-[#E4E5DF] active:bg-[#EFEFE9]">
              <div className="flex items-center gap-3">
                <Download size={16} className="text-[#777B75]" />
                <span className="text-sm text-[#20231F]">Export CSV</span>
              </div>
              <ChevronRight size={16} className="text-[#777B75]" />
            </button>
            <button onClick={handleImport} className="w-full flex items-center justify-between px-4 py-3.5 border-b border-[#E4E5DF] active:bg-[#EFEFE9]">
              <div className="flex items-center gap-3">
                <Upload size={16} className="text-[#777B75]" />
                <span className="text-sm text-[#20231F]">Restore Backup</span>
              </div>
              <ChevronRight size={16} className="text-[#777B75]" />
            </button>
            <button onClick={() => setShowReset(true)} className="w-full flex items-center justify-between px-4 py-3.5 active:bg-[#EFEFE9]">
              <div className="flex items-center gap-3">
                <Trash2 size={16} className="text-[#B84C43]" />
                <span className="text-sm text-[#B84C43]">Reset All Data</span>
              </div>
              <ChevronRight size={16} className="text-[#777B75]" />
            </button>
          </div>
        </div>

        {/* Lock */}
        <div>
          <Button variant="secondary" onClick={onLock} fullWidth>
            <span className="flex items-center justify-center gap-2">
              <Lock size={14} /> Lock App
            </span>
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showReset}
        onClose={() => setShowReset(false)}
        onConfirm={handleReset}
        title="Reset All Data"
        message="This will permanently delete all transactions, categories, people, debts, and settings. This action cannot be undone. Make sure you have a backup."
        confirmText="Delete Everything"
        danger
      />
    </div>
  );
}

// ============ ADD MONEY SCREEN ============
function AddMoneyScreen({ onBack, onSave }: { onBack: () => void; onSave: () => void }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('gift_allowance');
  const [date, setDate] = useState(getToday());
  const [person, setPerson] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const people = db.getPeople();
  const categories = db.getCategoriesByType('income');

  const typeOptions = [
    { value: 'earned_income', label: 'Earned Income' },
    { value: 'gift_allowance', label: 'Gift / Allowance' },
    { value: 'family_money', label: 'Family Money' },
    { value: 'person_money', label: 'From a Person' },
    { value: 'borrowed_money', label: 'Borrowed Money' },
    { value: 'loan_repayment_received', label: 'Loan Repayment Received' },
    { value: 'other_income', label: 'Other Income' },
  ];

  const handleSave = () => {
    const amountMinor = parseAmountInput(amount);
    if (!amountMinor) { setError('Enter a valid amount'); return; }
    if (!date) { setError('Select a date'); return; }
    
    setSaving(true);
    
    let personId: string | null = null;
    if (person.trim()) {
      const p = db.getOrCreatePerson(person.trim());
      personId = p.id;
    }

    // If borrowing, create a debt record
    let debtId: string | null = null;
    if (type === 'borrowed_money' && personId) {
      const debt = db.addDebt(personId, amountMinor, date, null, notes);
      debtId = debt.id;
    }

    db.addTransaction({
      transaction_type: type,
      amount: amountMinor,
      currency_code: 'PKR',
      category_id: categoryId || null,
      related_person_id: personId,
      description: person.trim() || typeOptions.find(t => t.value === type)?.label || 'Money Received',
      notes,
      transaction_date: date,
      related_debt_id: debtId,
    });

    setSaving(false);
    onSave();
  };

  return (
    <div className="pb-6">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="p-1"><ArrowLeft size={20} className="text-[#20231F]" /></button>
        <h1 className="text-xl font-bold text-[#20231F]">Add Money</h1>
      </div>

      <div className="px-5 space-y-4">
        <AmountInput value={amount} onChange={setAmount} error={error} />
        
        <Select
          label="Type"
          value={type}
          onChange={(v) => setType(v as TransactionType)}
          options={typeOptions}
        />

        <DateInput label="Date" value={date} onChange={setDate} />

        {(type === 'gift_allowance' || type === 'family_money' || type === 'person_money' || type === 'borrowed_money' || type === 'loan_repayment_received') && (
          <PersonInput value={person} onChange={setPerson} people={people} label="Received From" />
        )}

        <CategoryChips
          categories={categories}
          selected={categoryId}
          onSelect={setCategoryId}
          onAddCustom={(name) => {
            const cat = db.addCategory(name, 'income');
            setCategoryId(cat.id);
          }}
        />

        <TextArea label="Notes" value={notes} onChange={setNotes} placeholder="Optional notes..." />

        <div className="pt-2">
          <Button onClick={handleSave} disabled={saving} fullWidth>
            {saving ? 'Saving...' : 'Save Transaction'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============ ADD EXPENSE SCREEN ============
function AddExpenseScreen({ onBack, onSave }: { onBack: () => void; onSave: () => void }) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getToday());
  const [person, setPerson] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [saving, setSaving] = useState(false);

  const people = db.getPeople();
  const categories = db.getCategoriesByType('expense');
  const balance = db.calculateBalance();

  const handleSave = () => {
    const amountMinor = parseAmountInput(amount);
    if (!amountMinor) { setError('Enter a valid amount'); return; }
    if (!categoryId) { setError('Select a category'); return; }
    if (!date) { setError('Select a date'); return; }
    
    // Check if expense exceeds balance
    if (amountMinor > balance.current_balance) {
      setWarning('This expense exceeds your current balance. Continue anyway?');
    }

    setSaving(true);
    
    let personId: string | null = null;
    if (person.trim()) {
      const p = db.getOrCreatePerson(person.trim());
      personId = p.id;
    }

    const category = categories.find(c => c.id === categoryId);
    
    db.addTransaction({
      transaction_type: 'expense',
      amount: amountMinor,
      currency_code: 'PKR',
      category_id: categoryId,
      related_person_id: personId,
      description: person.trim() || category?.name || 'Expense',
      notes,
      transaction_date: date,
      related_debt_id: null,
    });

    setSaving(false);
    onSave();
  };

  return (
    <div className="pb-6">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="p-1"><ArrowLeft size={20} className="text-[#20231F]" /></button>
        <h1 className="text-xl font-bold text-[#20231F]">Add Expense</h1>
      </div>

      <div className="px-5 space-y-4">
        <AmountInput value={amount} onChange={(v) => { setAmount(v); setWarning(''); }} error={error} />

        {warning && (
          <div className="px-3 py-2 bg-[#B84C43]/10 border border-[#B84C43]/30">
            <p className="text-xs text-[#B84C43]">{warning}</p>
          </div>
        )}

        <DateInput label="Date" value={date} onChange={setDate} />

        <CategoryChips
          categories={categories}
          selected={categoryId}
          onSelect={setCategoryId}
          onAddCustom={(name) => {
            const cat = db.addCategory(name, 'expense');
            setCategoryId(cat.id);
          }}
        />

        <PersonInput value={person} onChange={setPerson} people={people} label="Paid To" />

        <TextArea label="Notes" value={notes} onChange={setNotes} placeholder="Optional notes..." />

        <div className="pt-2">
          <Button onClick={handleSave} disabled={saving} fullWidth>
            {saving ? 'Saving...' : 'Save Expense'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============ ADD BORROW SCREEN ============
function AddBorrowScreen({ onBack, onSave }: { onBack: () => void; onSave: () => void }) {
  const [amount, setAmount] = useState('');
  const [person, setPerson] = useState('');
  const [date, setDate] = useState(getToday());
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const people = db.getPeople();

  const handleSave = () => {
    const amountMinor = parseAmountInput(amount);
    if (!amountMinor) { setError('Enter a valid amount'); return; }
    if (!person.trim()) { setError('Enter the lender name'); return; }
    
    setSaving(true);
    const p = db.getOrCreatePerson(person.trim());
    
    // Create debt record
    const debt = db.addDebt(p.id, amountMinor, date, dueDate || null, notes);
    
    // Create transaction
    db.addTransaction({
      transaction_type: 'borrowed_money',
      amount: amountMinor,
      currency_code: 'PKR',
      category_id: null,
      related_person_id: p.id,
      description: `Borrowed from ${person.trim()}`,
      notes,
      transaction_date: date,
      related_debt_id: debt.id,
    });

    setSaving(false);
    onSave();
  };

  return (
    <div className="pb-6">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="p-1"><ArrowLeft size={20} className="text-[#20231F]" /></button>
        <h1 className="text-xl font-bold text-[#20231F]">Record Borrowing</h1>
      </div>

      <div className="px-5 space-y-4">
        <AmountInput value={amount} onChange={setAmount} error={error} />
        <PersonInput value={person} onChange={setPerson} people={people} label="Lender" />
        <DateInput label="Date Borrowed" value={date} onChange={setDate} />
        <DateInput label="Due Date (optional)" value={dueDate} onChange={setDueDate} />
        <TextArea label="Notes" value={notes} onChange={setNotes} placeholder="Optional notes..." />

        <div className="pt-2">
          <Button onClick={handleSave} disabled={saving} fullWidth>
            {saving ? 'Saving...' : 'Record Borrowing'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============ ADD REPAY SCREEN ============
function AddRepayScreen({ onBack, onSave }: { onBack: () => void; onSave: () => void }) {
  const [debtId, setDebtId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getToday());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const debts = db.getDebts().filter(d => d.status === 'open');

  const handleSave = () => {
    const amountMinor = parseAmountInput(amount);
    if (!amountMinor) { setError('Enter a valid amount'); return; }
    if (!debtId) { setError('Select a debt to repay'); return; }
    
    const remaining = db.getDebtRemaining(debtId);
    if (amountMinor > remaining) {
      setError(`Amount exceeds remaining debt (${formatCurrency(remaining)})`);
      return;
    }
    
    setSaving(true);
    const debt = db.getDebtById(debtId)!;
    const person = db.getPeople().find(p => p.id === debt.person_id);
    
    // Create repayment record
    db.addDebtRepayment(debtId, amountMinor, date, notes);
    
    // Create transaction
    db.addTransaction({
      transaction_type: 'repayment',
      amount: amountMinor,
      currency_code: 'PKR',
      category_id: null,
      related_person_id: debt.person_id,
      description: `Repaid to ${person?.name || 'lender'}`,
      notes,
      transaction_date: date,
      related_debt_id: debtId,
    });

    setSaving(false);
    onSave();
  };

  return (
    <div className="pb-6">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="p-1"><ArrowLeft size={20} className="text-[#20231F]" /></button>
        <h1 className="text-xl font-bold text-[#20231F]">Record Repayment</h1>
      </div>

      <div className="px-5 space-y-4">
        {debts.length === 0 ? (
          <EmptyState title="No outstanding debts" subtitle="All debts have been settled" />
        ) : (
          <>
            <Select
              label="Debt"
              value={debtId}
              onChange={setDebtId}
              placeholder="Select debt to repay"
              options={debts.map(d => {
                const person = db.getPeople().find(p => p.id === d.person_id);
                const remaining = db.getDebtRemaining(d.id);
                return {
                  value: d.id,
                  label: `${person?.name || 'Unknown'} - ${formatCurrency(remaining)} remaining`,
                };
              })}
              error={error}
            />

            <AmountInput value={amount} onChange={setAmount} autoFocus={false} />
            <DateInput label="Repayment Date" value={date} onChange={setDate} />
            <TextArea label="Notes" value={notes} onChange={setNotes} placeholder="Optional notes..." />

            <div className="pt-2">
              <Button onClick={handleSave} disabled={saving} fullWidth>
                {saving ? 'Saving...' : 'Record Repayment'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============ TRANSACTION DETAIL SCREEN ============
function TransactionDetailScreen({ txId, onBack, onEdit, onDelete, showToast }: { 
  txId: string; onBack: () => void; onEdit: () => void; onDelete: () => void; showToast: (m: string, t?: 'success' | 'error') => void 
}) {
  const [showDelete, setShowDelete] = useState(false);
  const tx = db.getTransactionById(txId);
  
  if (!tx) return <div className="p-5"><p>Transaction not found</p><Button onClick={onBack}>Go Back</Button></div>;

  const categories = db.getCategories();
  const people = db.getPeople();
  const category = categories.find(c => c.id === tx.category_id);
  const person = people.find(p => p.id === tx.related_person_id);

  const isIncoming = ['earned_income', 'gift_allowance', 'family_money', 'person_money', 'borrowed_money', 'loan_repayment_received', 'other_income'].includes(tx.transaction_type);
  const isExpense = tx.transaction_type === 'expense';
  const isRepayment = tx.transaction_type === 'repayment';

  const getTypeLabel = () => {
    switch (tx.transaction_type) {
      case 'earned_income': return 'Earned Income';
      case 'gift_allowance': return 'Gift / Allowance';
      case 'family_money': return 'Family Money';
      case 'person_money': return 'Money from Person';
      case 'borrowed_money': return 'Borrowed Money';
      case 'loan_repayment_received': return 'Loan Repayment Received';
      case 'other_income': return 'Other Income';
      case 'expense': return 'Expense';
      case 'repayment': return 'Debt Repayment';
      default: return 'Transaction';
    }
  };

  return (
    <div className="pb-6">
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1"><ArrowLeft size={20} className="text-[#20231F]" /></button>
          <h1 className="text-xl font-bold text-[#20231F]">Transaction Details</h1>
        </div>
      </div>

      <div className="px-5 space-y-4">
        {/* Amount */}
        <div className="bg-white border border-[#E4E5DF] p-5 text-center">
          <p className="text-xs text-[#777B75] uppercase tracking-wide mb-2">{getTypeLabel()}</p>
          <p className={`text-3xl font-bold tabular-nums ${isExpense || isRepayment ? 'text-[#B84C43]' : 'text-[#34764A]'}`}>
            {isExpense || isRepayment ? '-' : '+'}{formatCurrency(tx.amount)}
          </p>
        </div>

        {/* Details */}
        <div className="bg-white border border-[#E4E5DF]">
          <div className="px-4 py-3 border-b border-[#E4E5DF]">
            <p className="text-xs text-[#777B75] mb-0.5">Description</p>
            <p className="text-sm text-[#20231F] font-medium">{tx.description}</p>
          </div>
          <div className="px-4 py-3 border-b border-[#E4E5DF]">
            <p className="text-xs text-[#777B75] mb-0.5">Date</p>
            <p className="text-sm text-[#20231F]">{new Date(tx.transaction_date).toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          {category && (
            <div className="px-4 py-3 border-b border-[#E4E5DF]">
              <p className="text-xs text-[#777B75] mb-0.5">Category</p>
              <p className="text-sm text-[#20231F]">{category.name}</p>
            </div>
          )}
          {person && (
            <div className="px-4 py-3 border-b border-[#E4E5DF]">
              <p className="text-xs text-[#777B75] mb-0.5">{isExpense || isRepayment ? 'Paid To' : 'Received From'}</p>
              <p className="text-sm text-[#20231F]">{person.name}</p>
            </div>
          )}
          {tx.notes && (
            <div className="px-4 py-3">
              <p className="text-xs text-[#777B75] mb-0.5">Notes</p>
              <p className="text-sm text-[#20231F]">{tx.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onEdit} fullWidth>Edit</Button>
          <Button variant="danger" onClick={() => setShowDelete(true)} fullWidth>Delete</Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => { db.deleteTransaction(txId); onDelete(); }}
        title="Delete Transaction"
        message="This transaction will be permanently deleted. If this is a repayment, the associated debt record will be updated accordingly."
        confirmText="Delete"
        danger
      />
    </div>
  );
}

// ============ EDIT TRANSACTION SCREEN ============
function EditTransactionScreen({ txId, onBack, onSave }: { txId: string; onBack: () => void; onSave: () => void }) {
  const tx = db.getTransactionById(txId);
  const [amount, setAmount] = useState(tx ? (tx.amount / 100).toFixed(2) : '');
  const [date, setDate] = useState(tx?.transaction_date || getToday());
  const [description, setDescription] = useState(tx?.description || '');
  const [notes, setNotes] = useState(tx?.notes || '');
  const [categoryId, setCategoryId] = useState(tx?.category_id || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!tx) return <div className="p-5"><p>Transaction not found</p></div>;

  const isExpense = tx.transaction_type === 'expense';
  const categories = db.getCategoriesByType(isExpense ? 'expense' : 'income');

  const handleSave = () => {
    const amountMinor = parseAmountInput(amount);
    if (!amountMinor) { setError('Enter a valid amount'); return; }
    
    setSaving(true);
    db.updateTransaction(txId, {
      amount: amountMinor,
      transaction_date: date,
      description,
      notes,
      category_id: categoryId || null,
    });

    setSaving(false);
    onSave();
  };

  return (
    <div className="pb-6">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="p-1"><ArrowLeft size={20} className="text-[#20231F]" /></button>
        <h1 className="text-xl font-bold text-[#20231F]">Edit Transaction</h1>
      </div>

      <div className="px-5 space-y-4">
        <AmountInput value={amount} onChange={setAmount} error={error} autoFocus={false} />
        <Input label="Description" value={description} onChange={setDescription} />
        <DateInput label="Date" value={date} onChange={setDate} />
        
        <CategoryChips
          categories={categories}
          selected={categoryId}
          onSelect={setCategoryId}
        />

        <TextArea label="Notes" value={notes} onChange={setNotes} />

        <div className="pt-2">
          <Button onClick={handleSave} disabled={saving} fullWidth>
            {saving ? 'Saving...' : 'Update Transaction'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============ CHANGE PASSWORD SCREEN ============
function ChangePasswordScreen({ onBack, showToast }: { onBack: () => void; showToast: (m: string, t?: 'success' | 'error') => void }) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleChange = async () => {
    const auth = db.getAuth();
    const valid = await verifyPassword(current, auth.password_hash, auth.salt);
    if (!valid) { setError('Current password is incorrect'); return; }
    
    const err = validatePassword(newPass);
    if (err) { setError(err); return; }
    
    if (newPass !== confirm) { setError('New passwords do not match'); return; }
    
    const { hash, salt } = await createPasswordHash(newPass);
    db.saveAuth({ password_hash: hash, salt, is_setup: true });
    showToast('Password changed successfully');
    onBack();
  };

  return (
    <div className="pb-6">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="p-1"><ArrowLeft size={20} className="text-[#20231F]" /></button>
        <h1 className="text-xl font-bold text-[#20231F]">Change Password</h1>
      </div>

      <div className="px-5 space-y-4">
        <Input label="Current Password" type="password" value={current} onChange={setCurrent} />
        <Input label="New Password" type="password" value={newPass} onChange={setNewPass} placeholder="Min 8 characters" />
        <Input label="Confirm New Password" type="password" value={confirm} onChange={setConfirm} error={error} />
        <Button onClick={handleChange} fullWidth>Update Password</Button>
      </div>
    </div>
  );
}

// ============ SET PIN SCREEN ============
function SetPinScreen({ onBack, showToast }: { onBack: () => void; showToast: (m: string, t?: 'success' | 'error') => void }) {
  const settings = db.getSettings();
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const err = validatePin(pin);
    if (err) { setError(err); return; }
    if (pin !== confirm) { setError('PINs do not match'); return; }
    
    db.updateSettings({ pin_enabled: true, pin });
    showToast('PIN set successfully');
    onBack();
  };

  const handleDisable = () => {
    db.updateSettings({ pin_enabled: false, pin: null });
    showToast('PIN disabled');
    onBack();
  };

  return (
    <div className="pb-6">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="p-1"><ArrowLeft size={20} className="text-[#20231F]" /></button>
        <h1 className="text-xl font-bold text-[#20231F]">PIN Setup</h1>
      </div>

      <div className="px-5 space-y-4">
        {settings.pin_enabled ? (
          <>
            <p className="text-sm text-[#777B75]">PIN is currently enabled. You can disable it or set a new one.</p>
            <Button variant="danger" onClick={handleDisable} fullWidth>Disable PIN</Button>
            <hr className="border-[#E4E5DF]" />
          </>
        ) : null}
        
        <Input label="New PIN" type="password" value={pin} onChange={(v) => { if (v.length <= 6) setPin(v); }} inputMode="numeric" placeholder="4 or 6 digits" />
        <Input label="Confirm PIN" type="password" value={confirm} onChange={(v) => { if (v.length <= 6) setConfirm(v); }} inputMode="numeric" error={error} />
        <Button onClick={handleSave} fullWidth>Save PIN</Button>
      </div>
    </div>
  );
}
