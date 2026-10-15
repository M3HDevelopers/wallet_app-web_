import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'wallet_manager.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return db;
}

export async function initializeDB(): Promise<void> {
  const database = await getDatabase();
  
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category_type TEXT NOT NULL CHECK(category_type IN ('income', 'expense')),
      is_default INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS people (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS debts (
      id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL,
      original_amount INTEGER NOT NULL,
      borrowed_date TEXT NOT NULL,
      due_date TEXT,
      notes TEXT DEFAULT '',
      status TEXT DEFAULT 'open' CHECK(status IN ('open', 'settled')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (person_id) REFERENCES people(id)
    );

    CREATE TABLE IF NOT EXISTS debt_repayments (
      id TEXT PRIMARY KEY,
      debt_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      repayment_date TEXT NOT NULL,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      FOREIGN KEY (debt_id) REFERENCES debts(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      transaction_type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      currency_code TEXT DEFAULT 'PKR',
      category_id TEXT,
      related_person_id TEXT,
      description TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      transaction_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      related_debt_id TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (related_person_id) REFERENCES people(id),
      FOREIGN KEY (related_debt_id) REFERENCES debts(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_person ON transactions(related_person_id);
    CREATE INDEX IF NOT EXISTS idx_debts_person ON debts(person_id);
    CREATE INDEX IF NOT EXISTS idx_debts_status ON debts(status);
    CREATE INDEX IF NOT EXISTS idx_debt_repayments_debt ON debt_repayments(debt_id);
  `);

  // Insert default categories if not exists
  const count = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM categories'
  );
  
  if (count && count.count === 0) {
    await insertDefaultCategories(database);
  }

  // Initialize default settings
  await initializeSettings(database);
}

async function insertDefaultCategories(database: SQLite.SQLiteDatabase): Promise<void> {
  const now = new Date().toISOString();
  const categories = [
    { id: 'cat_earned', name: 'Earned Income', type: 'income' },
    { id: 'cat_gift', name: 'Gift / Allowance', type: 'income' },
    { id: 'cat_family', name: 'Family Money', type: 'income' },
    { id: 'cat_other_in', name: 'Other Income', type: 'income' },
    { id: 'cat_food', name: 'Food', type: 'expense' },
    { id: 'cat_transport', name: 'Transport', type: 'expense' },
    { id: 'cat_petrol', name: 'Petrol', type: 'expense' },
    { id: 'cat_shopping', name: 'Shopping', type: 'expense' },
    { id: 'cat_education', name: 'Education', type: 'expense' },
    { id: 'cat_mobile', name: 'Mobile & Internet', type: 'expense' },
    { id: 'cat_personal', name: 'Personal', type: 'expense' },
    { id: 'cat_family_exp', name: 'Family', type: 'expense' },
    { id: 'cat_health', name: 'Health', type: 'expense' },
    { id: 'cat_entertainment', name: 'Entertainment', type: 'expense' },
    { id: 'cat_other_exp', name: 'Other', type: 'expense' },
  ];

  for (const cat of categories) {
    await database.runAsync(
      'INSERT INTO categories (id, name, category_type, is_default, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?)',
      [cat.id, cat.name, cat.type, now, now]
    );
  }
}

async function initializeSettings(database: SQLite.SQLiteDatabase): Promise<void> {
  const defaults: Record<string, string> = {
    currency: 'PKR',
    date_format: 'dd MMM yyyy',
    hide_balance: 'false',
    pin_enabled: 'false',
    auto_lock_timeout: '300',
    opening_balance: '0',
    opening_balance_date: new Date().toISOString().split('T')[0],
    is_initialized: 'false',
  };

  for (const [key, value] of Object.entries(defaults)) {
    const existing = await database.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      [key]
    );
    
    if (!existing) {
      await database.runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?)',
        [key, value]
      );
    }
  }
}

// ============ AUTH ============
export async function getAuth(): Promise<{ password_hash: string; salt: string; is_setup: boolean }> {
  try {
    const hash = await SecureStore.getItemAsync('password_hash');
    const salt = await SecureStore.getItemAsync('password_salt');
    
    if (hash && salt) {
      return { password_hash: hash, salt, is_setup: true };
    }
  } catch (e) {
    console.error('Failed to get auth:', e);
  }
  
  return { password_hash: '', salt: '', is_setup: false };
}

export async function saveAuth(passwordHash: string, salt: string): Promise<void> {
  try {
    await SecureStore.setItemAsync('password_hash', passwordHash);
    await SecureStore.setItemAsync('password_salt', salt);
  } catch (e) {
    console.error('Failed to save auth:', e);
  }
}

export async function clearAuth(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync('password_hash');
    await SecureStore.deleteItemAsync('password_salt');
  } catch (e) {
    console.error('Failed to clear auth:', e);
  }
}

// Re-export auth utilities for convenience
export { createPasswordHash, verifyPassword, validatePassword, validatePin } from '../utils/auth';

// Re-export debt functions
export async function getDebts(): Promise<any[]> {
  const database = await getDatabase();
  return await database.getAllAsync('SELECT * FROM debts ORDER BY borrowed_date DESC');
}

// ============ SETTINGS ============
export async function getSettings(): Promise<Record<string, string>> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM settings'
  );
  
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  
  return settings;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    [key, value]
  );
}

// ============ CATEGORIES ============
export async function getCategories(): Promise<any[]> {
  const database = await getDatabase();
  return await database.getAllAsync('SELECT * FROM categories ORDER BY category_type, name');
}

export async function getCategoriesByType(type: 'income' | 'expense'): Promise<any[]> {
  const database = await getDatabase();
  return await database.getAllAsync(
    'SELECT * FROM categories WHERE category_type = ? ORDER BY name',
    [type]
  );
}

export async function addCategory(name: string, type: 'income' | 'expense'): Promise<string> {
  const database = await getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();
  
  await database.runAsync(
    'INSERT INTO categories (id, name, category_type, is_default, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?)',
    [id, name, type, now, now]
  );
  
  return id;
}

// ============ PEOPLE ============
export async function getPeople(): Promise<any[]> {
  const database = await getDatabase();
  return await database.getAllAsync('SELECT * FROM people ORDER BY name');
}

export async function getOrCreatePerson(name: string): Promise<string> {
  const database = await getDatabase();
  
  const existing = await database.getFirstAsync<{ id: string }>(
    'SELECT id FROM people WHERE LOWER(name) = LOWER(?)',
    [name]
  );
  
  if (existing) {
    return existing.id;
  }
  
  const id = uuidv4();
  const now = new Date().toISOString();
  
  await database.runAsync(
    'INSERT INTO people (id, name, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [id, name, '', now, now]
  );
  
  return id;
}

// ============ TRANSACTIONS ============
export async function getTransactions(): Promise<any[]> {
  const database = await getDatabase();
  return await database.getAllAsync(
    'SELECT * FROM transactions ORDER BY transaction_date DESC, created_at DESC'
  );
}

export async function getTransactionById(id: string): Promise<any | null> {
  const database = await getDatabase();
  return await database.getFirstAsync('SELECT * FROM transactions WHERE id = ?', [id]);
}

export async function addTransaction(tx: any): Promise<string> {
  const database = await getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();
  
  await database.runAsync(
    `INSERT INTO transactions (id, transaction_type, amount, currency_code, category_id, related_person_id, description, notes, transaction_date, created_at, updated_at, related_debt_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tx.transaction_type,
      tx.amount,
      tx.currency_code || 'PKR',
      tx.category_id,
      tx.related_person_id,
      tx.description || '',
      tx.notes || '',
      tx.transaction_date,
      now,
      now,
      tx.related_debt_id,
    ]
  );
  
  return id;
}

export async function updateTransaction(id: string, updates: any): Promise<void> {
  const database = await getDatabase();
  const now = new Date().toISOString();
  
  const fields: string[] = [];
  const values: any[] = [];
  
  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  
  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);
  
  await database.runAsync(
    `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

// ============ DEBTS ============
export async function getDebtById(id: string): Promise<any | null> {
  const database = await getDatabase();
  return await database.getFirstAsync('SELECT * FROM debts WHERE id = ?', [id]);
}

export async function addDebt(personId: string, amount: number, borrowedDate: string, dueDate: string | null, notes: string): Promise<string> {
  const database = await getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();
  
  await database.runAsync(
    'INSERT INTO debts (id, person_id, original_amount, borrowed_date, due_date, notes, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, personId, amount, borrowedDate, dueDate, notes, 'open', now, now]
  );
  
  return id;
}

export async function getDebtRemaining(debtId: string): Promise<number> {
  const database = await getDatabase();
  
  const debt = await database.getFirstAsync<{ original_amount: number }>(
    'SELECT original_amount FROM debts WHERE id = ?',
    [debtId]
  );
  
  if (!debt) return 0;
  
  const repayments = await database.getAllAsync<{ amount: number }>(
    'SELECT amount FROM debt_repayments WHERE debt_id = ?',
    [debtId]
  );
  
  const totalRepaid = repayments.reduce((sum, r) => sum + r.amount, 0);
  return debt.original_amount - totalRepaid;
}

export async function addDebtRepayment(debtId: string, amount: number, date: string, notes: string): Promise<string> {
  const database = await getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();
  
  await database.runAsync(
    'INSERT INTO debt_repayments (id, debt_id, amount, repayment_date, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, debtId, amount, date, notes, now]
  );
  
  // Update debt status
  const remaining = await getDebtRemaining(debtId);
  const status = remaining <= 0 ? 'settled' : 'open';
  
  await database.runAsync(
    'UPDATE debts SET status = ?, updated_at = ? WHERE id = ?',
    [status, now, debtId]
  );
  
  return id;
}

// ============ BALANCE CALCULATIONS ============
export async function calculateBalance(): Promise<{
  current_balance: number;
  total_income: number;
  total_earned: number;
  total_expenses: number;
  total_borrowed: number;
  total_repaid: number;
  outstanding_debt: number;
}> {
  const database = await getDatabase();
  const settings = await getSettings();
  
  const openingBalance = parseInt(settings.opening_balance || '0');
  
  const incomeTypes = ['earned_income', 'gift_allowance', 'family_money', 'person_money', 'borrowed_money', 'loan_repayment_received', 'other_income'];
  const cashInTypes = incomeTypes;
  const cashOutTypes = ['expense', 'repayment'];
  
  const totalIncome = await calculateSumByTypes(incomeTypes);
  const totalEarned = await calculateSumByTypes(['earned_income']);
  const totalExpenses = await calculateSumByTypes(['expense']);
  const totalBorrowed = await calculateSumByTypes(['borrowed_money']);
  const totalRepaid = await calculateSumByTypes(['repayment']);
  
  const cashIn = await calculateSumByTypes(cashInTypes);
  const cashOut = await calculateSumByTypes(cashOutTypes);
  
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

async function calculateSumByTypes(types: string[]): Promise<number> {
  const database = await getDatabase();
  
  if (types.length === 0) return 0;
  
  const placeholders = types.map(() => '?').join(',');
  const result = await database.getFirstAsync<{ total: number }>(
    `SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE transaction_type IN (${placeholders})`,
    types
  );
  
  return result?.total || 0;
}

export async function searchTransactions(query: string, filters?: {
  type?: string;
  category_id?: string;
  person_id?: string;
  start_date?: string;
  end_date?: string;
}): Promise<any[]> {
  const database = await getDatabase();
  
  let sql = 'SELECT * FROM transactions WHERE 1=1';
  const params: any[] = [];
  
  if (query) {
    sql += ' AND (LOWER(description) LIKE ? OR LOWER(notes) LIKE ?)';
    const q = `%${query.toLowerCase()}%`;
    params.push(q, q);
  }
  
  if (filters?.type) {
    sql += ' AND transaction_type = ?';
    params.push(filters.type);
  }
  
  if (filters?.category_id) {
    sql += ' AND category_id = ?';
    params.push(filters.category_id);
  }
  
  if (filters?.person_id) {
    sql += ' AND related_person_id = ?';
    params.push(filters.person_id);
  }
  
  if (filters?.start_date && filters?.end_date) {
    sql += ' AND transaction_date BETWEEN ? AND ?';
    params.push(filters.start_date, filters.end_date);
  }
  
  sql += ' ORDER BY transaction_date DESC, created_at DESC';
  
  return await database.getAllAsync(sql, params);
}

// ============ RESET ============
export async function resetAllData(): Promise<void> {
  const database = await getDatabase();
  
  await database.execAsync(`
    DELETE FROM transactions;
    DELETE FROM debt_repayments;
    DELETE FROM debts;
    DELETE FROM people;
    DELETE FROM categories;
    DELETE FROM settings;
  `);
  
  await clearAuth();
  await initializeDB();
}
