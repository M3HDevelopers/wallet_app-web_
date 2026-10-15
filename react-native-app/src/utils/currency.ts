// All monetary values stored as integers (paisa)
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
  const formatted = absAmount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const prefix = currency === 'PKR' ? 'Rs.' : currency;
  return `${isNegative ? '-' : ''}${prefix} ${formatted}`;
}

export function parseAmountInput(value: string): number | null {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  if (isNaN(num) || num <= 0) return null;
  return toMinorUnits(num);
}

export function formatAmountDisplay(value: string): string {
  let cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) cleaned = parts[0] + '.' + parts.slice(1).join('');
  if (parts.length === 2 && parts[1].length > 2) cleaned = parts[0] + '.' + parts[1].slice(0, 2);
  return cleaned;
}
