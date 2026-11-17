/** Date helpers — all calculations are in the device's local calendar. */

export const DAY_MS = 86_400_000;

export function parseISODate(iso: string): Date {
  // Tolerates both `YYYY-MM-DD` and full timestamps (`YYYY-MM-DDTHH:mm:ssZ`).
  const [year, month, day] = iso.slice(0, 10).split('-').map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toISODate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(days: number, from: Date = new Date()): Date {
  const next = new Date(from);
  next.setDate(next.getDate() + days);
  return next;
}

export function addDaysISO(days: number, from: Date = new Date()): string {
  return toISODate(addDays(days, from));
}

/** Whole days between today and an ISO date. Negative = overdue. */
export function daysUntil(iso: string, from: Date = new Date()): number {
  return Math.round((startOfDay(parseISODate(iso)).getTime() - startOfDay(from).getTime()) / DAY_MS);
}

/** Next occurrence of a month/day (birthdays, anniversaries). 29 Feb rolls to 1 Mar in non-leap years. */
export function nextOccurrence(iso: string, from: Date = new Date()): Date {
  const source = parseISODate(iso);
  const base = startOfDay(from);
  const candidate = new Date(base.getFullYear(), source.getMonth(), source.getDate());
  if (candidate.getTime() < base.getTime()) {
    return new Date(base.getFullYear() + 1, source.getMonth(), source.getDate());
  }
  return candidate;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export function formatShortDate(iso: string): string {
  const date = parseISODate(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatLongDate(iso: string): string {
  const date = parseISODate(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "Overdue by 2 days" · "Today" · "Tomorrow" · "In 5 days" */
export function dueLabel(days: number): string {
  if (days < -1) return `Overdue by ${Math.abs(days)} days`;
  if (days === -1) return 'Overdue by 1 day';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

export function daysLeftLabel(iso: string, from: Date = new Date()): string {
  const days = Math.max(0, daysUntil(iso, from));
  if (days === 0) return 'ends today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}
