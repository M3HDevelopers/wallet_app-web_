import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============ BUTTON ============
export function Button({ 
  children, onClick, variant = 'primary', disabled = false, fullWidth = false, className = '', type = 'button'
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  const base = 'px-4 py-3 font-medium text-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100';
  const variants = {
    primary: 'bg-[#376B4B] text-white',
    secondary: 'bg-[#EFEFE9] text-[#20231F] border border-[#E4E5DF]',
    danger: 'bg-[#B84C43] text-white',
    ghost: 'bg-transparent text-[#777B75]',
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

// ============ INPUT ============
export function Input({ 
  label, error, value, onChange, type = 'text', placeholder, required = false, 
  icon, inputMode, autoFocus = false, maxLength
}: {
  label?: string;
  error?: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  inputMode?: 'text' | 'numeric' | 'decimal';
  autoFocus?: boolean;
  maxLength?: number;
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-[#777B75] mb-1.5 uppercase tracking-wide">
          {label} {required && <span className="text-[#B84C43]">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777B75]">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          autoFocus={autoFocus}
          maxLength={maxLength}
          className={`w-full px-3 py-3 bg-white border text-[#20231F] placeholder-[#777B75]/50 
            focus:outline-none focus:border-[#376B4B] transition-colors
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-[#B84C43]' : 'border-[#E4E5DF]'}`}
        />
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-xs text-[#B84C43] mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ============ SELECT ============
export function Select({ 
  label, value, onChange, options, placeholder, error, required = false
}: {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-[#777B75] mb-1.5 uppercase tracking-wide">
          {label} {required && <span className="text-[#B84C43]">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-3 bg-white border text-[#20231F] appearance-none
          focus:outline-none focus:border-[#376B4B] transition-colors
          ${error ? 'border-[#B84C43]' : 'border-[#E4E5DF]'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-[#B84C43] mt-1">{error}</p>}
    </div>
  );
}

// ============ TEXTAREA ============
export function TextArea({ 
  label, value, onChange, placeholder, rows = 3
}: {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-[#777B75] mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-3 bg-white border border-[#E4E5DF] text-[#20231F] 
          placeholder-[#777B75]/50 focus:outline-none focus:border-[#376B4B] transition-colors resize-none"
      />
    </div>
  );
}

// ============ MODAL ============
export function Modal({ 
  isOpen, onClose, title, children, action
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="relative w-full max-w-lg bg-[#F7F7F3] border-t border-[#E4E5DF] max-h-[85vh] overflow-y-auto safe-bottom"
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#20231F]">{title}</h3>
                <button onClick={onClose} className="p-1 text-[#777B75]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              {children}
              {action && <div className="mt-4">{action}</div>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============ CONFIRM DIALOG ============
export function ConfirmDialog({ 
  isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  danger?: boolean;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-[#777B75] leading-relaxed">{message}</p>
      <div className="flex gap-3 mt-5">
        <Button variant="secondary" onClick={onClose} fullWidth>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }} fullWidth>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}

// ============ TOAST ============
export function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 bg-[#20231F] text-white text-sm font-medium shadow-lg"
    >
      {message}
    </motion.div>
  );
}

// ============ EMPTY STATE ============
export function EmptyState({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-12 h-12 bg-[#EFEFE9] flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#777B75" strokeWidth="1.5">
          <rect x="2" y="3" width="20" height="18" rx="0"/><line x1="2" y1="9" x2="22" y2="9"/>
        </svg>
      </div>
      <h3 className="text-base font-medium text-[#20231F] mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-[#777B75] text-center mb-4">{subtitle}</p>}
      {action}
    </div>
  );
}

// ============ AMOUNT INPUT ============
export function AmountInput({ 
  value, onChange, currency = 'PKR', error, autoFocus = true
}: {
  value: string;
  onChange: (val: string) => void;
  currency?: string;
  error?: string;
  autoFocus?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (val: string) => {
    let cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) cleaned = parts[0] + '.' + parts.slice(1).join('');
    if (parts.length === 2 && parts[1].length > 2) cleaned = parts[0] + '.' + parts[1].slice(0, 2);
    onChange(cleaned);
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-medium text-[#777B75] mb-1.5 uppercase tracking-wide">
        Amount <span className="text-[#B84C43]">*</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777B75] font-medium text-sm">
          {currency === 'PKR' ? 'Rs.' : currency}
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="0.00"
          autoFocus={autoFocus}
          className={`w-full pl-12 pr-4 py-4 bg-white border text-2xl font-semibold tabular-nums text-[#20231F]
            placeholder-[#777B75]/30 focus:outline-none focus:border-[#376B4B] transition-colors
            ${error ? 'border-[#B84C43]' : 'border-[#E4E5DF]'}`}
        />
      </div>
      {error && <p className="text-xs text-[#B84C43] mt-1">{error}</p>}
    </div>
  );
}

// ============ CATEGORY CHIPS ============
export function CategoryChips({ 
  categories, selected, onSelect, onAddCustom 
}: {
  categories: { id: string; name: string }[];
  selected: string;
  onSelect: (id: string) => void;
  onAddCustom?: (name: string) => void;
}) {
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');

  return (
    <div>
      <label className="block text-xs font-medium text-[#777B75] mb-2 uppercase tracking-wide">
        Category <span className="text-[#B84C43]">*</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`px-3 py-2 text-xs font-medium border transition-colors
              ${selected === cat.id 
                ? 'bg-[#376B4B] text-white border-[#376B4B]' 
                : 'bg-white text-[#20231F] border-[#E4E5DF] active:bg-[#EFEFE9]'}`}
          >
            {cat.name}
          </button>
        ))}
        {onAddCustom && (
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="px-3 py-2 text-xs font-medium border border-dashed border-[#777B75] text-[#777B75] active:bg-[#EFEFE9]"
          >
            + Custom
          </button>
        )}
      </div>
      {showCustom && onAddCustom && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 flex gap-2">
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Category name"
            className="flex-1 px-3 py-2 bg-white border border-[#E4E5DF] text-sm focus:outline-none focus:border-[#376B4B]"
          />
          <Button onClick={() => { if (customName.trim()) { onAddCustom(customName.trim()); setCustomName(''); setShowCustom(false); } }}>
            Add
          </Button>
        </motion.div>
      )}
    </div>
  );
}

// ============ PERSON INPUT ============
export function PersonInput({ 
  value, onChange, people, label = 'From / To'
}: {
  value: string;
  onChange: (val: string) => void;
  people: { id: string; name: string }[];
  label?: string;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const filtered = people.filter(p => p.name.toLowerCase().includes(value.toLowerCase()));

  return (
    <div className="relative w-full">
      <label className="block text-xs font-medium text-[#777B75] mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => { onChange(e.target.value); setShowDropdown(true); }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder="Enter name"
        className="w-full px-3 py-3 bg-white border border-[#E4E5DF] text-[#20231F] 
          placeholder-[#777B75]/50 focus:outline-none focus:border-[#376B4B] transition-colors"
      />
      {showDropdown && filtered.length > 0 && value.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-[#E4E5DF] max-h-40 overflow-y-auto">
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => { onChange(p.name); setShowDropdown(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-[#EFEFE9] transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ TRANSACTION ROW ============
export function TransactionRow({ 
  transaction, onClick
}: {
  transaction: {
    id: string;
    transaction_type: string;
    amount: number;
    description: string;
    transaction_date: string;
    category_id: string | null;
    related_person_id: string | null;
  };
  onClick: () => void;
}) {
  const isExpense = transaction.transaction_type === 'expense';
  const isRepayment = transaction.transaction_type === 'repayment';
  
  const getLabel = () => {
    switch (transaction.transaction_type) {
      case 'earned_income': return 'Earned Income';
      case 'gift_allowance': return 'Gift / Allowance';
      case 'family_money': return 'Family Money';
      case 'person_money': return 'Received';
      case 'borrowed_money': return 'Borrowed';
      case 'loan_repayment_received': return 'Repayment In';
      case 'other_income': return 'Other Income';
      case 'expense': return 'Expense';
      case 'repayment': return 'Debt Repayment';
      default: return 'Transaction';
    }
  };

  const getTypeIcon = () => {
    if (isExpense) return (
      <div className="w-8 h-8 bg-[#B84C43]/10 flex items-center justify-center mr-3 flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B84C43" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
      </div>
    );
    if (isRepayment) return (
      <div className="w-8 h-8 bg-[#B84C43]/10 flex items-center justify-center mr-3 flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B84C43" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
      </div>
    );
    return (
      <div className="w-8 h-8 bg-[#34764A]/10 flex items-center justify-center mr-3 flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34764A" strokeWidth="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
      </div>
    );
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="w-full flex items-center py-3 px-4 border-b border-[#E4E5DF] active:bg-[#EFEFE9] transition-colors text-left"
    >
      {getTypeIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#20231F] truncate">{transaction.description || getLabel()}</p>
        <p className="text-xs text-[#777B75] mt-0.5">{getLabel()} &middot; {new Date(transaction.transaction_date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</p>
      </div>
      <div className="text-right ml-3 flex-shrink-0">
        <p className={`text-sm font-semibold tabular-nums ${
          isExpense || isRepayment ? 'text-[#B84C43]' : 'text-[#34764A]'
        }`}>
          {isExpense || isRepayment ? '-' : '+'}
          Rs. {(transaction.amount / 100).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </motion.button>
  );
}

// ============ SUMMARY CARD ============
export function SummaryCard({ label, amount, color = 'default' }: { label: string; amount: number; color?: 'default' | 'income' | 'expense' }) {
  const colorClass = color === 'income' ? 'text-[#34764A]' : color === 'expense' ? 'text-[#B84C43]' : 'text-[#20231F]';
  
  return (
    <div className="bg-white border border-[#E4E5DF] p-4">
      <p className="text-xs text-[#777B75] uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-lg font-semibold tabular-nums ${colorClass}`}>
        Rs. {Math.abs(amount / 100).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}

// ============ DATE INPUT ============
export function DateInput({ label, value, onChange }: { label?: string; value: string; onChange: (val: string) => void }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-[#777B75] mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-3 bg-white border border-[#E4E5DF] text-[#20231F] 
          focus:outline-none focus:border-[#376B4B] transition-colors"
      />
    </div>
  );
}
