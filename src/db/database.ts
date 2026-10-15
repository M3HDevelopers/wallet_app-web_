import { v4 as uuidv4 } from 'uuid';
import type { AppData, Transaction, Category, Person, Debt, DebtRepayment, Settings, AuthData, BalanceSummary, PeriodSummary, CategoryBreakdown, TransactionType } from '../types';
import { isDateInRange } from '../utils/date';

const DB_KEY = 'wallet_manager_db';

function getDefaultCategories(): Category[] {
  const now = new Date().toISOString();
  return [
    // Income categories
    { id: 'cat_earned', name: 'Earned Income', category_type: 'income', is_default: true, created_at: now, updated_at: now },
    { id: 'cat_gift', name: 'Gift / Allowance', category_type: 'income', is_default: true, created_at: now, updated_at: now },
    { id: 'cat_family', name: 'Family Money', category_type: 'income', is_default: true, created_at: now, updated_at: now },
    { id: 'cat_other_in', name: 'Other Income', category_type: 'income', is_default: true, created_at: now, updated_at: now },
    // Expense categories
    { id: 'cat_food', name: 'Food', category_type: 'expense', is_default: true, created_at: now, updated_at: now },
    { id: 'cat_transport', name: 'Transport', category_type: 'expense', is_default: true, created_at: now, updated_at: now },
    { id: 'cat_petrol', name: 'Petrol', category_type: 'expense', is_default: true, created_at: now, updated_at: now },
    { id: 'cat_shopping', name: 'Shopping', category_type: 'expense', is_default: true, created_at: now, updated_at: now },
    { id: 'cat_education', name: 'Education', category_type: 'expense', is_default: true, created_at: now, updated_at: now },
    { id: 'cat_mobile', name: 'Mobile & Internet', category_type: 'expense', is_default: true, created_at: now, updated_at: now },
    { id: 'cat_personal', name: 'Personal', category_type: 'expense', is_default: true, created_at: now, updated_at: now },
    { id: 'cat_family_exp', name: 'Family', category_type: 'expense', is_default: true, created_at: now, updated_at: now },
    { id: 'cat_health', name: 'Health', category_type: 'expense', is_default: true, created_at: now, updated_at: now },
    { id: 'cat_entertainment', name: 'Entertainment', category_type: 'expense', is_default: true, created_at: now, updated_at: now },
    { id: 'cat_other_exp', name: 'Other', category_type: 'expense', is_default: true, created_at: now, updated_at: now },
  ];
}

function getDefaultSettings(): Settings {
  return {
    currency: 'PKR',
    date_format: 'dd MMM yyyy',
    hide_balance: false,
    pin_enabled: false,
    pin: null,
    auto_lock_timeout: 300,
    opening_balance: 0,
    opening_balance_date: new Date().toISOString().split('T')[0],
    is_initialized: false,
  };
}

function getDefaultAuth(): AuthData {
  return {
    password_hash: '',
    salt: '',
    is_setup: false,
  };
}

function loadDB(): AppData {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load database:', e);
  }
  
  return {
    transactions: [],
    categories: getDefaultCategories(),
    people: [],
    debts: [],
    debt_repayments: [],
    settings: getDefaultSettings(),
    auth: getDefaultAuth(),
  };
}

function saveDB(data: AppData): void {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save database:', e);
  }
}

// ============ AUTH ============
export function getAuth(): AuthData {
  return loadDB().auth;
}

export function saveAuth(auth: AuthData): void {
  const data = loadDB();
  data.auth = auth;
  saveDB(data);
}

// ============ SETTINGS ============
export function getSettings(): Settings {
  return loadDB().settings;
}

export function updateSettings(updates: Partial<Settings>): Settings {
  const data = loadDB();
  data.settings = { ...data.settings, ...updates };
  saveDB(data);
  return data.settings;
}

// ============ CATEGORIES ============
export function getCategories(): Category[] {
  return loadDB().categories;
}

export function getCategoriesByType(type: 'income' | 'expense'): Category[] {
  return loadDB().categories.filter(c => c.category_type === type);
}

export function addCategory(name: string, type: 'income' | 'expense'): Category {
  const data = loadDB();
  const now = new Date().toISOString();
  const category: Category = {
    id: uuidv4(),
    name,
    category_type: type,
    is_default: false,
    created_at: now,
    updated_at: now,
  };
  data.categories.push(category);
  saveDB(data);
  return category;
}

// ============ PEOPLE ============
export function getPeople(): Person[] {
  return loadDB().people;
}

export function addPerson(name: string, notes: string = ''): Person {
  const data = loadDB();
  const existing = data.people.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing;
  
  const now = new Date().toISOString();
  const person: Person = {
    id: uuidv4(),
    name,
    notes,
    created_at: now,
    updated_at: now,
  };
  data.people.push(person);
  saveDB(data);
  return person;
}

export function getOrCreatePerson(name: string): Person {
  const data = loadDB();
  const existing = data.people.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (existing) return existing;
  return addPerson(name);
}

// ============ TRANSACTIONS ============
export function getTransactions(): Transaction[] {
  return loadDB().transactions.sort((a, b) => 
    new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
  );
}

export function getTransactionById(id: string): Transaction | undefined {
  return loadDB().transactions.find(t => t.id === id);
}

export function addTransaction(tx: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Transaction {
  const data = loadDB();
  const now = new Date().toISOString();
  const transaction: Transaction = {
    ...tx,
    id: uuidv4(),
    created_at: now,
    updated_at: now,
  };
  data.transactions.push(transaction);
  saveDB(data);
  return transaction;
}

export function updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
  const data = loadDB();
  const idx = data.transactions.findIndex(t => t.id === id);
  if (idx === -1) return null;
  
  data.transactions[idx] = {
    ...data.transactions[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  saveDB(data);
  return data.transactions[idx];
}

export function deleteTransaction(id: string): boolean {
  const data = loadDB();
  const idx = data.transactions.findIndex(t => t.id === id);
  if (idx === -1) return false;
  
  const tx = data.transactions[idx];
  
  // If it's a repayment transaction, also update the debt
  if (tx.related_debt_id && tx.transaction_type === 'repayment') {
    const repayment = data.debt_repayments.find(r => r.debt_id === tx.related_debt_id && r.amount === tx.amount);
    if (repayment) {
      data.debt_repayments = data.debt_repayments.filter(r => r.id !== repayment.id);
      // Recalculate debt status
      const debt = data.debts.find(d => d.id === tx.related_debt_id);
      if (debt) {
        const totalRepaid = data.debt_repayments
          .filter(r => r.debt_id === debt.id)
          .reduce((sum, r) => sum + r.amount, 0);
        debt.status = totalRepaid >= debt.original_amount ? 'settled' : 'open';
        debt.updated_at = new Date().toISOString();
      }
    }
  }
  
  data.transactions.splice(idx, 1);
  saveDB(data);
  return true;
}

// ============ DEBTS ============
export function getDebts(): Debt[] {
  return loadDB().debts.sort((a, b) => 
    new Date(b.borrowed_date).getTime() - new Date(a.borrowed_date).getTime()
  );
}

export function getDebtById(id: string): Debt | undefined {
  return loadDB().debts.find(d => d.id === id);
}

export function addDebt(personId: string, amount: number, borrowedDate: string, dueDate: string | null, notes: string): Debt {
  const data = loadDB();
  const now = new Date().toISOString();
  const debt: Debt = {
    id: uuidv4(),
    person_id: personId,
    original_amount: amount,
    borrowed_date: borrowedDate,
    due_date: dueDate,
    notes,
    status: 'open',
    created_at: now,
    updated_at: now,
  };
  data.debts.push(debt);
  saveDB(data);
  return debt;
}

export function getDebtRepayments(debtId?: string): DebtRepayment[] {
  const data = loadDB();
  if (debtId) {
    return data.debt_repayments.filter(r => r.debt_id === debtId);
  }
  return data.debt_repayments;
}

export function addDebtRepayment(debtId: string, amount: number, date: string, notes: string): DebtRepayment {
  const data = loadDB();
  const now = new Date().toISOString();
  const repayment: DebtRepayment = {
    id: uuidv4(),
    debt_id: debtId,
    amount,
    repayment_date: date,
    notes,
    created_at: now,
  };
  data.debt_repayments.push(repayment);
  
  // Update debt status
  const debt = data.debts.find(d => d.id === debtId);
  if (debt) {
    const totalRepaid = data.debt_repayments
      .filter(r => r.debt_id === debtId)
      .reduce((sum, r) => sum + r.amount, 0);
    debt.status = totalRepaid >= debt.original_amount ? 'settled' : 'open';
    debt.updated_at = now;
  }
  
  saveDB(data);
  return repayment;
}

export function getDebtRemaining(debtId: string): number {
  const data = loadDB();
  const debt = data.debts.find(d => d.id === debtId);
  if (!debt) return 0;
  const totalRepaid = data.debt_repayments
    .filter(r => r.debt_id === debtId)
    .reduce((sum, r) => sum + r.amount, 0);
  return debt.original_amount - totalRepaid;
}

// ============ BALANCE CALCULATIONS ============
const INCOME_TYPES: TransactionType[] = ['earned_income', 'gift_allowance', 'family_money', 'person_money', 'borrowed_money', 'loan_repayment_received', 'other_income'];
const CASH_IN_TYPES: TransactionType[] = ['earned_income', 'gift_allowance', 'family_money', 'person_money', 'borrowed_money', 'loan_repayment_received', 'other_income'];
const CASH_OUT_TYPES: TransactionType[] = ['expense', 'repayment'];

export function calculateBalance(): BalanceSummary {
  const data = loadDB();
  const transactions = data.transactions;
  
  const totalIncome = transactions
    .filter(t => INCOME_TYPES.includes(t.transaction_type))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalEarned = transactions
    .filter(t => t.transaction_type === 'earned_income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalBorrowed = transactions
    .filter(t => t.transaction_type === 'borrowed_money')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalRepaid = transactions
    .filter(t => t.transaction_type === 'repayment')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const cashIn = transactions
    .filter(t => CASH_IN_TYPES.includes(t.transaction_type))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const cashOut = transactions
    .filter(t => CASH_OUT_TYPES.includes(t.transaction_type))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const openingBalance = data.settings.opening_balance;
  const currentBalance = openingBalance + cashIn - cashOut;
  
  return {
    current_balance: currentBalance,
    total_income: totalIncome,
    total_earned: totalEarned,
    total_expenses: totalExpenses,
    total_borrowed: totalBorrowed,
    total_repaid: totalRepaid,
    outstanding_debt: totalBorrowed - totalRepaid,
  };
}

export function calculatePeriodSummary(startDate: string, endDate: string): PeriodSummary {
  const data = loadDB();
  const transactions = data.transactions.filter(t => isDateInRange(t.transaction_date, startDate, endDate));
  
  const moneyReceived = transactions
    .filter(t => ['gift_allowance', 'family_money', 'person_money', 'other_income'].includes(t.transaction_type))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const earnedIncome = transactions
    .filter(t => t.transaction_type === 'earned_income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const borrowedFunds = transactions
    .filter(t => t.transaction_type === 'borrowed_money')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const repaymentsMade = transactions
    .filter(t => t.transaction_type === 'repayment')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const cashIn = transactions
    .filter(t => CASH_IN_TYPES.includes(t.transaction_type))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const cashOut = transactions
    .filter(t => CASH_OUT_TYPES.includes(t.transaction_type))
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    money_received: moneyReceived,
    earned_income: earnedIncome,
    total_expenses: totalExpenses,
    borrowed_funds: borrowedFunds,
    repayments_made: repaymentsMade,
    net_movement: cashIn - cashOut,
  };
}

export function getCategoryBreakdown(startDate?: string, endDate?: string): CategoryBreakdown[] {
  const data = loadDB();
  let transactions = data.transactions.filter(t => t.transaction_type === 'expense');
  
  if (startDate && endDate) {
    transactions = transactions.filter(t => isDateInRange(t.transaction_date, startDate, endDate));
  }
  
  const breakdown: Record<string, { total: number; count: number }> = {};
  
  for (const tx of transactions) {
    const catId = tx.category_id || 'uncategorized';
    if (!breakdown[catId]) {
      breakdown[catId] = { total: 0, count: 0 };
    }
    breakdown[catId].total += tx.amount;
    breakdown[catId].count += 1;
  }
  
  return Object.entries(breakdown).map(([catId, bData]) => {
    const category = data.categories.find(c => c.id === catId);
    return {
      category_id: catId,
      category_name: category?.name || 'Uncategorized',
      total: bData.total,
      count: bData.count,
    };
  }).sort((a, b) => b.total - a.total);
}

// ============ SEARCH & FILTER ============
export function searchTransactions(query: string, filters?: {
  type?: TransactionType;
  category_id?: string;
  person_id?: string;
  start_date?: string;
  end_date?: string;
}): Transaction[] {
  const data = loadDB();
  let transactions = [...data.transactions].sort((a, b) => 
    new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
  );
  
  if (query) {
    const q = query.toLowerCase();
    const people = data.people;
    const matchingPersonIds = people.filter(p => p.name.toLowerCase().includes(q)).map(p => p.id);
    
    transactions = transactions.filter(t => 
      t.description.toLowerCase().includes(q) ||
      t.notes.toLowerCase().includes(q) ||
      (t.related_person_id && matchingPersonIds.includes(t.related_person_id))
    );
  }
  
  if (filters?.type) {
    transactions = transactions.filter(t => t.transaction_type === filters.type);
  }
  if (filters?.category_id) {
    transactions = transactions.filter(t => t.category_id === filters.category_id);
  }
  if (filters?.person_id) {
    transactions = transactions.filter(t => t.related_person_id === filters.person_id);
  }
  if (filters?.start_date && filters?.end_date) {
    transactions = transactions.filter(t => isDateInRange(t.transaction_date, filters.start_date!, filters.end_date!));
  }
  
  return transactions;
}

// ============ EXPORT / BACKUP ============
export function exportBackup(): string {
  const data = loadDB();
  const backup = {
    version: 1,
    exported_at: new Date().toISOString(),
    transactions: data.transactions,
    categories: data.categories,
    people: data.people,
    debts: data.debts,
    debt_repayments: data.debt_repayments,
    settings: { ...data.settings, pin: null }, // Never export PIN
  };
  return JSON.stringify(backup, null, 2);
}

export function exportCSV(): string {
  const data = loadDB();
  const headers = ['Date', 'Type', 'Amount', 'Description', 'Category', 'Person', 'Notes'];
  const rows = data.transactions.map(t => {
    const category = data.categories.find(c => c.id === t.category_id);
    const person = data.people.find(p => p.id === t.related_person_id);
    return [
      t.transaction_date,
      t.transaction_type,
      (t.amount / 100).toFixed(2),
      `"${t.description.replace(/"/g, '""')}"`,
      category?.name || '',
      person?.name || '',
      `"${t.notes.replace(/"/g, '""')}"`,
    ].join(',');
  });
  return [headers.join(','), ...rows].join('\n');
}

export function importBackup(jsonStr: string): { success: boolean; error?: string } {
  try {
    const backup = JSON.parse(jsonStr);
    if (!backup.version || !backup.transactions || !backup.categories) {
      return { success: false, error: 'Invalid backup format' };
    }
    
    const data: AppData = {
      transactions: backup.transactions || [],
      categories: backup.categories || getDefaultCategories(),
      people: backup.people || [],
      debts: backup.debts || [],
      debt_repayments: backup.debt_repayments || [],
      settings: { ...getDefaultSettings(), ...backup.settings, is_initialized: true },
      auth: loadDB().auth, // Keep current auth
    };
    
    saveDB(data);
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Failed to parse backup file' };
  }
}

export function resetAllData(): void {
  const defaultData: AppData = {
    transactions: [],
    categories: getDefaultCategories(),
    people: [],
    debts: [],
    debt_repayments: [],
    settings: getDefaultSettings(),
    auth: getDefaultAuth(),
  };
  saveDB(defaultData);
}

// Initialize database
export function initializeDB(): void {
  const data = loadDB();
  if (data.categories.length === 0) {
    data.categories = getDefaultCategories();
    saveDB(data);
  }
}
