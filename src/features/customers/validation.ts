/**
 * Customer form validation (zod) + the mapping into repository input.
 * Validate on blur; the screen reads `errors[fieldId]` and renders it inline.
 */
import { z } from 'zod';

import type { Customer, NewCustomer } from '@/data/types';
import { todayISO } from '@/lib/date';
import { zodFieldErrors, type FieldErrors } from '@/lib/forms';
import { formatPhoneDisplay, toE164 } from '@/lib/phone';

const NAME_MAX = 80;
const NOTES_MAX = 500;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const optionalPhone = z
  .string()
  .trim()
  .refine((value) => !value || toE164(value) !== null, { error: 'Use a valid phone number, e.g. 0803 123 4567' });

const optionalEmail = z
  .string()
  .trim()
  .refine((value) => !value || EMAIL_PATTERN.test(value), { error: 'Enter a valid email address' });

/** `2026-02-30` matches the pattern but is not a real date. */
function isRealDate(iso: string): boolean {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
  return date.getFullYear() === year && date.getMonth() === (month ?? 1) - 1 && date.getDate() === day;
}

const pastDate = (label: string) =>
  z
    .string()
    .trim()
    .refine((value) => !value || ISO_DATE.test(value), { error: 'Use the date picker' })
    .refine((value) => !value || isRealDate(value), { error: 'That date does not exist' })
    .refine((value) => !value || value <= todayISO(), { error: `${label} cannot be in the future` });

export const customerFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Enter the customer’s full name')
    .max(NAME_MAX, `Keep the name under ${NAME_MAX} characters`),
  phone: z
    .string()
    .trim()
    .min(1, 'Enter a phone number')
    .refine((value) => toE164(value) !== null, { error: 'Use a valid phone number, e.g. 0803 123 4567' }),
  whatsapp: optionalPhone,
  email: optionalEmail,
  gender: z.enum(['female', 'male', 'other']).optional(),
  birthday: pastDate('Birthday'),
  anniversary: pastDate('Anniversary'),
  photoUrl: z.string().trim().optional(),
  notes: z.string().trim().max(NOTES_MAX, `Keep notes under ${NOTES_MAX} characters`),
  /** "Add measurements next" — a screen decision, never persisted. */
  measureNext: z.boolean(),
});

export type CustomerFormValues = z.input<typeof customerFormSchema>;
export type ValidCustomerForm = z.output<typeof customerFormSchema>;

export const EMPTY_CUSTOMER_FORM: CustomerFormValues = {
  fullName: '',
  phone: '',
  whatsapp: '',
  email: '',
  birthday: '',
  anniversary: '',
  photoUrl: '',
  notes: '',
  measureNext: true,
};

export function validateCustomerForm(values: CustomerFormValues):
  | { success: true; data: ValidCustomerForm }
  | { success: false; errors: FieldErrors } {
  const result = customerFormSchema.safeParse(values);
  if (result.success) return { success: true, data: result.data };
  return { success: false, errors: zodFieldErrors(result.error) };
}

/** Requires a validated form: the E.164 phone is guaranteed by the schema. */
export function toNewCustomer(values: ValidCustomerForm): NewCustomer {
  const phoneE164 = toE164(values.phone);
  if (!phoneE164) throw new Error('toNewCustomer needs a validated form — run validateCustomerForm first');
  const whatsapp = values.whatsapp ? toE164(values.whatsapp) : null;

  return {
    fullName: values.fullName,
    phoneE164,
    whatsappE164: whatsapp ?? undefined,
    email: values.email || undefined,
    gender: values.gender,
    birthday: values.birthday || undefined,
    anniversary: values.anniversary || undefined,
    photoUrl: values.photoUrl || undefined,
    notes: values.notes || undefined,
  };
}

/** Duplicate guard (G-16): same E.164 anywhere in this business's book. */
export function findDuplicatePhone(customers: Customer[], input: string): Customer | undefined {
  const target = toE164(input);
  if (!target) return undefined;
  return customers.find((customer) => toE164(customer.phoneE164) === target);
}

/**
 * Prefills the edit form from a stored customer. Phones are shown in local form
 * (`0803 123 4567`) because that is what the tailor typed; the schema normalises
 * them back to E.164 on save.
 */
export function toFormValues(customer: Customer): CustomerFormValues {
  return {
    ...EMPTY_CUSTOMER_FORM,
    fullName: customer.fullName,
    phone: formatPhoneDisplay(customer.phoneE164),
    whatsapp: customer.whatsappE164 ? formatPhoneDisplay(customer.whatsappE164) : '',
    email: customer.email ?? '',
    gender: customer.gender,
    birthday: customer.birthday ?? '',
    anniversary: customer.anniversary ?? '',
    photoUrl: customer.photoUrl ?? '',
    notes: customer.notes ?? '',
    measureNext: false,
  };
}
