import { describe, expect, it } from 'vitest';

import { formatPhoneDisplay, isValidPhone, toE164, whatsappUrl } from '../phone';

describe('toE164', () => {
  it('normalises local Nigerian formats', () => {
    expect(toE164('0803 123 4567')).toBe('+2348031234567');
    expect(toE164('08031234567')).toBe('+2348031234567');
    expect(toE164('803 123 4567')).toBe('+2348031234567');
    expect(toE164('8031234567')).toBe('+2348031234567');
  });

  it('normalises country-code formats', () => {
    expect(toE164('+234 803 123 4567')).toBe('+2348031234567');
    expect(toE164('2348031234567')).toBe('+2348031234567');
    expect(toE164('+2348031234567')).toBe('+2348031234567');
  });

  it('accepts international numbers only when a plus is supplied', () => {
    expect(toE164('+44 7700 900123')).toBe('+447700900123');
    expect(toE164('447700900123')).toBeNull();
  });

  it('rejects junk, empty and too-short input', () => {
    expect(toE164('')).toBeNull();
    expect(toE164('   ')).toBeNull();
    expect(toE164('abc')).toBeNull();
    expect(toE164('12345')).toBeNull();
    expect(toE164('0203 123 4567')).toBeNull();
  });
});

describe('formatPhoneDisplay', () => {
  it('shows Nigerian numbers in local form', () => {
    expect(formatPhoneDisplay('+2348031234567')).toBe('0803 123 4567');
  });

  it('passes through unknown formats and empty values', () => {
    expect(formatPhoneDisplay('+447700900123')).toBe('+447700900123');
    expect(formatPhoneDisplay(undefined)).toBe('');
  });
});

describe('whatsappUrl (mandatory test case #9)', () => {
  it('builds a wa.me link with digits only', () => {
    const e164 = toE164('0803 123 4567');
    expect(e164).toBe('+2348031234567');
    expect(whatsappUrl(e164)).toBe('https://wa.me/2348031234567');
  });

  it('encodes the prefilled message', () => {
    expect(whatsappUrl('+2348031234567', 'Your gown is ready')).toBe(
      'https://wa.me/2348031234567?text=Your%20gown%20is%20ready',
    );
  });

  it('returns null when there is no number', () => {
    expect(whatsappUrl(undefined)).toBeNull();
    expect(isValidPhone('nope')).toBe(false);
  });
});
