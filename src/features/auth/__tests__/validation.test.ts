import { describe, expect, it } from 'vitest';

import { hasErrors, passwordStrength, validateEmail, validateSignUp, type SignUpValues } from '../validation';

const valid: SignUpValues = {
  fullName: 'Adaeze Okafor',
  email: 'adaeze@dioks.app',
  password: 'Sewing2026!',
  confirmPassword: 'Sewing2026!',
  referralCode: '',
  acceptedTerms: true,
};

describe('validateEmail', () => {
  it('accepts a normal address', () => {
    expect(validateEmail('adaeze@dioks.app')).toBeUndefined();
  });

  it('rejects empty, malformed and trailing-dot addresses', () => {
    expect(validateEmail('')).toBe('Enter your email address');
    expect(validateEmail('adaeze@')).toBe('Enter a valid email address');
    expect(validateEmail('adaeze@dioks')).toBe('Enter a valid email address');
  });
});

describe('validateSignUp', () => {
  it('passes a complete form', () => {
    expect(hasErrors(validateSignUp(valid))).toBe(false);
  });

  it('requires a full name of at least two characters', () => {
    expect(validateSignUp({ ...valid, fullName: 'A' }).fullName).toBe('Enter your full name');
  });

  it('rejects short passwords', () => {
    expect(validateSignUp({ ...valid, password: 'short', confirmPassword: 'short' }).password).toBe(
      'Use at least 8 characters',
    );
  });

  it('requires matching passwords', () => {
    expect(validateSignUp({ ...valid, confirmPassword: 'Different1!' }).confirmPassword).toBe(
      'Passwords do not match',
    );
  });

  it('requires consent', () => {
    expect(validateSignUp({ ...valid, acceptedTerms: false }).acceptedTerms).toBe(
      'Please accept the terms to continue',
    );
  });

  it('accepts an empty referral code but validates a supplied one', () => {
    expect(validateSignUp(valid).referralCode).toBeUndefined();
    expect(validateSignUp({ ...valid, referralCode: 'DIOKS-AB12' }).referralCode).toBeUndefined();
    expect(validateSignUp({ ...valid, referralCode: 'FREE-100' }).referralCode).toBe('Codes look like DIOKS-AB12');
  });
});

describe('passwordStrength', () => {
  it('scores weak, fair, good and strong input', () => {
    expect(passwordStrength('abc').level).toBe('weak');
    expect(passwordStrength('abcdefgh1').level).toBe('fair');
    expect(passwordStrength('abcdefgH1').level).toBe('good');
    expect(passwordStrength('abcdefgH1!xyz').level).toBe('strong');
  });

  it('never exceeds 4', () => {
    expect(passwordStrength('aVeryLongPassword123!@#').score).toBe(4);
  });
});
