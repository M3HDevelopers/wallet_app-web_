import { format, parseISO, isToday, isYesterday, startOfMonth, endOfMonth, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'dd MMM yyyy');
}

export function formatDateShort(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'dd MMM');
}

export function formatFullDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'EEEE, dd MMMM yyyy');
}

export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const date = new Date(year, month, 1);
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
}

export function getDayRange(dateStr: string): { start: string; end: string } {
  const date = parseISO(dateStr);
  const start = startOfDay(date);
  const end = endOfDay(date);
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
}

export function isDateInRange(dateStr: string, rangeStart: string, rangeEnd: string): boolean {
  const date = parseISO(dateStr);
  const start = parseISO(rangeStart);
  const end = parseISO(rangeEnd);
  return isWithinInterval(date, { start: startOfDay(start), end: endOfDay(end) });
}

export function getCurrentGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function getCurrentDateFormatted(): string {
  return format(new Date(), 'EEEE, dd MMMM yyyy');
}

export { format, parseISO, isToday };
