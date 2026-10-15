export type TransactionType =
  | 'earned_income'
  | 'gift_allowance'
  | 'family_money'
  | 'person_money'
  | 'borrowed_money'
  | 'loan_repayment_received'
  | 'other_income'
  | 'expense'
  | 'repayment';

export interface Transaction {
  id: string;
  transaction_type: TransactionType;
  amount: number; // stored as integer (paisa/cents)
  currency_code: string;
  category_id: string | null;
  related_person_id: string | null;
  description: string;
  notes: string;
  transaction_date: string; // ISO date string
  created_at: string;
  updated_at: string;
  related_debt_id: string | null;
}

export interface Category {
  id: string;
  name: string;
  category_type: 'income' | 'expense';
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  name: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Debt {
  id: string;
  person_id: string;
  original_amount: number; // integer minor units
  borrowed_date: string;
  due_date: string | null;
  notes: string;
  status: 'open' | 'settled';
  created_at: string;
  updated_at: string;
}

export interface DebtRepayment {
  id: string;
  debt_id: string;
  amount: number; // integer minor units
  repayment_date: string;
  notes: string;
  created_at: string;
}

export interface Settings {
  currency: string;
  date_format: string;
  hide_balance: boolean;
  pin_enabled: boolean;
  pin: string | null;
  auto_lock_timeout: number; // seconds
  opening_balance: number;
  opening_balance_date: string;
  is_initialized: boolean;
}

export interface AuthData {
  password_hash: string;
  salt: string;
  is_setup: boolean;
}

export interface AppData {
  transactions: Transaction[];
  categories: Category[];
  people: Person[];
  debts: Debt[];
  debt_repayments: DebtRepayment[];
  settings: Settings;
  auth: AuthData;
}

export interface BalanceSummary {
  current_balance: number;
  total_income: number;
  total_earned: number;
  total_expenses: number;
  total_borrowed: number;
  total_repaid: number;
  outstanding_debt: number;
}

export interface PeriodSummary {
  money_received: number;
  earned_income: number;
  total_expenses: number;
  borrowed_funds: number;
  repayments_made: number;
  net_movement: number;
}

export interface CategoryBreakdown {
  category_id: string;
  category_name: string;
  total: number;
  count: number;
}
