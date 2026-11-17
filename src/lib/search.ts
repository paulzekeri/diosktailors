import type { Customer } from '@/data/types';

/**
 * Customer search. One predicate used by the repository (server-side equivalent
 * in Phase 11) and by screens filtering cached rows, so results never disagree.
 *
 * Two traps this handles:
 * - a query with no digits must never match on phone (`"".includes("")` is true,
 *   which returned the whole book for any text search);
 * - stored numbers are E.164 (`+234803…`) while tailors type local form
 *   (`0803…`), so both sides are compared as national *and* full digits.
 */
function digitForms(value: string): string[] {
  const digits = value.replace(/\D/g, '');
  if (!digits) return [];

  const forms = new Set([digits]);
  if (digits.startsWith('0')) forms.add(digits.slice(1));
  if (digits.startsWith('234') && digits.length > 10) forms.add(digits.slice(3));
  return [...forms];
}

export function matchesCustomerQuery(
  customer: Pick<Customer, 'fullName' | 'phoneE164' | 'whatsappE164'>,
  term: string,
): boolean {
  const query = term.trim().toLowerCase();
  if (!query) return true;

  if (customer.fullName.toLowerCase().includes(query)) return true;

  const queries = digitForms(query);
  if (queries.length === 0) return false;

  return [customer.phoneE164, customer.whatsappE164 ?? ''].some((number) => {
    const forms = digitForms(number);
    return queries.some((needle) => forms.some((form) => form.includes(needle)));
  });
}
