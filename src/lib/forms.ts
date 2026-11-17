import type { z } from 'zod';

/**
 * Form validation plumbing shared by every screen from Phase 4 on.
 * Screens keep a `FieldErrors` bag keyed by field id and render it inline;
 * auth keeps its own hand-rolled validators (already covered by tests).
 */
export type FieldErrors = Record<string, string | undefined>;

/** Flattens zod issues into `{ fieldId: firstMessage }`. Arrays join with dots. */
export function zodFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.map(String).join('.') : 'form';
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export function hasFieldErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

/** First invalid field, so the screen can scroll to it (design contract §4.6). */
export function firstErrorField(errors: FieldErrors, order: string[]): string | undefined {
  return order.find((field) => Boolean(errors[field]));
}
