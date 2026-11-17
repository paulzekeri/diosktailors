/** Auth form validation — plain functions (unit-testable, no runtime dependency). */

export type FieldErrors = Record<string, string | undefined>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REFERRAL_PATTERN = /^DIOKS-[A-Z0-9]{4}$/i;

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return 'Enter your email address';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address';
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Enter a password';
  if (value.length < 8) return 'Use at least 8 characters';
  return undefined;
}

export function validateSignIn(values: { email: string; password: string }): FieldErrors {
  return {
    email: validateEmail(values.email),
    password: values.password ? undefined : 'Enter your password',
  };
}

export interface SignUpValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  referralCode: string;
  acceptedTerms: boolean;
}

export function validateSignUp(values: SignUpValues): FieldErrors {
  return {
    fullName: values.fullName.trim().length < 2 ? 'Enter your full name' : undefined,
    email: validateEmail(values.email),
    password: validatePassword(values.password),
    confirmPassword:
      values.password !== values.confirmPassword
        ? 'Passwords do not match'
        : validatePassword(values.confirmPassword),
    referralCode:
      values.referralCode.trim().length > 0 && !REFERRAL_PATTERN.test(values.referralCode.trim())
        ? 'Codes look like DIOKS-AB12'
        : undefined,
    acceptedTerms: values.acceptedTerms ? undefined : 'Please accept the terms to continue',
  };
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

/** 0–4 score used by the register screen's strength meter. */
export function passwordStrength(password: string): { score: number; level: StrengthLevel; label: string } {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const capped = Math.min(4, score);
  const level: StrengthLevel = capped <= 1 ? 'weak' : capped === 2 ? 'fair' : capped === 3 ? 'good' : 'strong';
  const label = level === 'weak' ? 'Weak' : level === 'fair' ? 'Fair' : level === 'good' ? 'Good' : 'Strong';
  return { score: capped, level, label };
}
