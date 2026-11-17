/**
 * Customers list shaping: A–Z sections and the "N active" badge.
 * Pure, so the 500-row list stays a rendering problem rather than a logic one.
 */
import type { Customer, Project } from '@/data/types';

/** A job is active until it is delivered or archived (matches the dashboard stat). */
export const ACTIVE_JOB_STATUSES: ReadonlyArray<Project['status']> = ['pending', 'in_progress'];

export interface CustomerSection {
  /** `A`–`Z`, or `#` for names that start with a digit or symbol. */
  title: string;
  data: Customer[];
}

/** `{ cus_1: 2 }` — active jobs per customer, for the list badge. */
export function activeJobCounts(projects: Project[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const project of projects) {
    if (!ACTIVE_JOB_STATUSES.includes(project.status)) continue;
    counts[project.customerId] = (counts[project.customerId] ?? 0) + 1;
  }
  return counts;
}

function initialOf(name: string): string {
  const first = name.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : '#';
}

/**
 * A–Z sections in order, `#` last. Assumes the input is already sorted by name
 * (the repository does that) but sorts defensively so a cached page cannot
 * scramble the order.
 */
export function sectionByInitial(customers: Customer[]): CustomerSection[] {
  const sorted = [...customers].sort((a, b) => a.fullName.localeCompare(b.fullName));
  const sections = new Map<string, Customer[]>();

  for (const customer of sorted) {
    const title = initialOf(customer.fullName);
    const bucket = sections.get(title);
    if (bucket) bucket.push(customer);
    else sections.set(title, [customer]);
  }

  return [...sections.entries()]
    .map(([title, data]) => ({ title, data }))
    .sort((a, b) => (a.title === '#' ? 1 : b.title === '#' ? -1 : a.title.localeCompare(b.title)));
}

/** "6 customers · sorted A–Z" / "2 matches for “bola”". */
export function customerCountLabel(count: number, term: string): string {
  const plural = `${count} ${count === 1 ? 'customer' : 'customers'}`;
  if (!term.trim()) return `${plural} · sorted A–Z`;
  return count === 1 ? `1 match for “${term.trim()}”` : `${count} matches for “${term.trim()}”`;
}

/** "2 active jobs" — singular/plural, omitted when there are none. */
export function activeJobLabel(count: number): string | undefined {
  if (count <= 0) return undefined;
  return count === 1 ? '1 active job' : `${count} active jobs`;
}
