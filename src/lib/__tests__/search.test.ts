import { describe, expect, it } from 'vitest';

import { matchesCustomerQuery } from '../search';

const bola = { fullName: 'Bola Adeyemi', phoneE164: '+2348031234567', whatsappE164: undefined };
const chidi = { fullName: 'Chidi Nwosu', phoneE164: '+2347019876543', whatsappE164: '+2348020000000' };

describe('matchesCustomerQuery', () => {
  it('matches everything for an empty or blank query', () => {
    expect(matchesCustomerQuery(bola, '')).toBe(true);
    expect(matchesCustomerQuery(bola, '   ')).toBe(true);
  });

  it('matches names case-insensitively', () => {
    expect(matchesCustomerQuery(bola, 'bola')).toBe(true);
    expect(matchesCustomerQuery(bola, 'BOLA ADE')).toBe(true);
    expect(matchesCustomerQuery(bola, 'nwosu')).toBe(false);
  });

  it('matches phone digits in any format', () => {
    expect(matchesCustomerQuery(bola, '0803 123')).toBe(true);
    expect(matchesCustomerQuery(bola, '2348031')).toBe(true);
    expect(matchesCustomerQuery(bola, '+234 803 123 4567')).toBe(true);
  });

  it('never matches a text-only query against the phone number', () => {
    // Regression: `"2348031234567".includes("")` is true, which made every
    // text search return the whole book.
    expect(matchesCustomerQuery(bola, 'zzz')).toBe(false);
    expect(matchesCustomerQuery(chidi, 'xyz')).toBe(false);
  });

  it('falls back to the WhatsApp number when it differs', () => {
    expect(matchesCustomerQuery(chidi, '0802 000')).toBe(true);
  });
});
