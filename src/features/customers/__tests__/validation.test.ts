import { describe, expect, it } from 'vitest';

import type { Customer } from '@/data/types';
import { addDaysISO } from '@/lib/date';
import {
  EMPTY_CUSTOMER_FORM,
  findDuplicatePhone,
  toFormValues,
  toNewCustomer,
  validateCustomerForm,
  type CustomerFormValues,
} from '../validation';

const validForm: CustomerFormValues = {
  ...EMPTY_CUSTOMER_FORM,
  fullName: '  Bola Adeyemi ',
  phone: '0803 123 4567',
};

function expectValid(values: CustomerFormValues) {
  const result = validateCustomerForm(values);
  if (!result.success) throw new Error(`expected a valid form, got ${JSON.stringify(result.errors)}`);
  return result.data;
}

function expectInvalid(values: CustomerFormValues) {
  const result = validateCustomerForm(values);
  if (result.success) throw new Error('expected the form to be invalid');
  return result.errors;
}

describe('validateCustomerForm', () => {
  it('accepts the minimum a customer needs and trims the name', () => {
    const data = expectValid(validForm);
    expect(data.fullName).toBe('Bola Adeyemi');
    expect(data.phone).toBe('0803 123 4567');
  });

  it('requires a name of at least two characters', () => {
    expect(expectInvalid({ ...validForm, fullName: '  ' }).fullName).toBe('Enter the customer’s full name');
    expect(expectInvalid({ ...validForm, fullName: 'B' }).fullName).toBe('Enter the customer’s full name');
  });

  it('requires a phone number it can normalise', () => {
    expect(expectInvalid({ ...validForm, phone: '' }).phone).toBe('Enter a phone number');
    expect(expectInvalid({ ...validForm, phone: '12345' }).phone).toBe(
      'Use a valid phone number, e.g. 0803 123 4567',
    );
  });

  it('treats whatsapp and email as optional but validated when present', () => {
    expect(expectValid({ ...validForm, whatsapp: '', email: '' }).email).toBe('');
    expect(expectInvalid({ ...validForm, whatsapp: 'nope' }).whatsapp).toBe(
      'Use a valid phone number, e.g. 0803 123 4567',
    );
    expect(expectInvalid({ ...validForm, email: 'nope' }).email).toBe('Enter a valid email address');
  });

  it('rejects impossible dates and future birthdays or anniversaries', () => {
    expect(expectInvalid({ ...validForm, birthday: '2026-02-30' }).birthday).toBe('That date does not exist');
    expect(expectInvalid({ ...validForm, birthday: addDaysISO(1) }).birthday).toBe(
      'Birthday cannot be in the future',
    );
    expect(expectInvalid({ ...validForm, anniversary: addDaysISO(400) }).anniversary).toBe(
      'Anniversary cannot be in the future',
    );
    expect(expectValid({ ...validForm, birthday: '1990-05-01', anniversary: '2018-11-24' }).birthday).toBe(
      '1990-05-01',
    );
  });

  it('caps the notes field', () => {
    expect(expectInvalid({ ...validForm, notes: 'x'.repeat(501) }).notes).toBe('Keep notes under 500 characters');
  });
});

describe('toNewCustomer', () => {
  it('normalises phones to E.164 and drops empty optionals', () => {
    const data = expectValid({
      ...validForm,
      whatsapp: '0803 123 4568',
      email: 'bola@example.com',
      birthday: '1990-05-01',
    });
    const input = toNewCustomer(data);

    expect(input.phoneE164).toBe('+2348031234567');
    expect(input.whatsappE164).toBe('+2348031234568');
    expect(input.email).toBe('bola@example.com');
    expect(input.birthday).toBe('1990-05-01');
    expect(input.notes).toBeUndefined();
    expect(input.photoUrl).toBeUndefined();
    expect(input.anniversary).toBeUndefined();
  });

  it('refuses to build a customer from an unvalidated phone', () => {
    const data = expectValid(validForm);
    expect(() => toNewCustomer({ ...data, phone: 'nope' })).toThrow(/validated form/);
  });
});

describe('toFormValues (edit prefill)', () => {
  const stored = {
    id: 'cus_1',
    businessId: 'biz_1',
    fullName: 'Adaeze Okafor',
    phoneE164: '+2348031234567',
    whatsappE164: '+2348031234568',
    email: 'adaeze@example.com',
    gender: 'female',
    birthday: '1990-05-01',
    notes: 'Prefers fitted sleeves.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  } as Customer;

  it('shows phones in local form so the tailor recognises them', () => {
    const values = toFormValues(stored);
    expect(values.phone).toBe('0803 123 4567');
    expect(values.whatsapp).toBe('0803 123 4568');
  });

  it('round-trips through the schema back to E.164 without drift', () => {
    const values = toFormValues(stored);
    const result = validateCustomerForm(values);
    if (!result.success) throw new Error(JSON.stringify(result.errors));

    const input = toNewCustomer(result.data);
    expect(input.phoneE164).toBe(stored.phoneE164);
    expect(input.whatsappE164).toBe(stored.whatsappE164);
    expect(input.fullName).toBe(stored.fullName);
    expect(input.email).toBe(stored.email);
    expect(input.gender).toBe('female');
    expect(input.birthday).toBe(stored.birthday);
    expect(input.notes).toBe(stored.notes);
  });

  it('fills blanks for everything optional and never re-arms "measure next"', () => {
    const values = toFormValues({ ...stored, whatsappE164: undefined, email: undefined, birthday: undefined } as Customer);
    expect(values.whatsapp).toBe('');
    expect(values.email).toBe('');
    expect(values.birthday).toBe('');
    expect(values.notes).toBe('Prefers fitted sleeves.');
    expect(values.measureNext).toBe(false);
  });
});

describe('findDuplicatePhone', () => {
  const customers = [
    { id: 'cus_1', phoneE164: '+2348031234567' },
    { id: 'cus_2', phoneE164: '+2348031234568' },
  ] as Customer[];

  it('matches the same number typed differently', () => {
    expect(findDuplicatePhone(customers, '0803 123 4567')?.id).toBe('cus_1');
    expect(findDuplicatePhone(customers, '+234 803 123 4567')?.id).toBe('cus_1');
  });

  it('returns nothing for a new or unparseable number', () => {
    expect(findDuplicatePhone(customers, '0803 999 0000')).toBeUndefined();
    expect(findDuplicatePhone(customers, 'nope')).toBeUndefined();
  });
});
