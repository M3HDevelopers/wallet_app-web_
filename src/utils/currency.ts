// All monetary values are stored as integers (minor units - paisa)
// 1 Rupee = 100 paisa

export function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

export function fromMinorUnits(minorUnits: number): number {
  return minorUnits / 100;
}

export function formatCurrency(minorUnits: number, currency: string = 'PKR'): string {
  const amount = fromMinorUnits(minorUnits);
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = absAmount.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  const prefix = currency === 'PKR' ? 'Rs.' : currency;
  return `${isNegative ? '-' : ''}${prefix} ${formatted}`;
}

export function formatAmountInput(value: string): string {
  // Remove non-numeric characters except decimal point
  let cleaned = value.replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit to 2 decimal places
  if (parts.length === 2 && parts[1].length > 2) {
    cleaned = parts[0] + '.' + parts[1].slice(0, 2);
  }
  
  return cleaned;
}

export function parseAmountInput(value: string): number | null {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num) || num <= 0) return null;
  return toMinorUnits(num);
}
