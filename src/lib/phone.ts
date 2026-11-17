/**
 * Phone normalisation — Nigeria first, but tolerant of international input.
 * `wa.me` requires international digits with no plus/spaces, so every phone
 * number is stored as E.164 and converted at the point of use.
 */

const NG_COUNTRY_CODE = '234';

function digitsOnly(value: string): string {
  return value.replace(/[^\d]/g, '');
}

/** Returns E.164 (`+2348031234567`) or null when the input cannot be trusted. */
export function toE164(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const hasPlus = trimmed.startsWith('+');
  let digits = digitsOnly(trimmed);
  if (!digits) return null;

  // +234…, 234…, 0803…, 803…
  if (digits.startsWith(NG_COUNTRY_CODE)) {
    const local = digits.slice(NG_COUNTRY_CODE.length);
    if (local.length === 10 && /^[789]/.test(local)) return `+${NG_COUNTRY_CODE}${local}`;
    if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
  }

  if (digits.startsWith('0') && digits.length === 11) {
    const local = digits.slice(1);
    if (/^[789]/.test(local)) return `+${NG_COUNTRY_CODE}${local}`;
  }

  if (digits.length === 10 && /^[789]/.test(digits)) {
    return `+${NG_COUNTRY_CODE}${digits}`;
  }

  // Any other international number: accept only when the caller supplied a plus.
  if (hasPlus && digits.length >= 8 && digits.length <= 15) return `+${digits}`;

  return null;
}

export function isValidPhone(input: string): boolean {
  return toE164(input) !== null;
}

/** `+2348031234567` → `0803 123 4567` for display to Nigerian users. */
export function formatPhoneDisplay(e164: string | null | undefined): string {
  if (!e164) return '';
  const digits = digitsOnly(e164);
  if (digits.startsWith(NG_COUNTRY_CODE) && digits.length === 13) {
    const local = digits.slice(3);
    return `0${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return e164;
}

/** Digits only, for `https://wa.me/<digits>`. */
export function whatsappNumber(e164: string | null | undefined): string {
  return e164 ? digitsOnly(e164) : '';
}

export function whatsappUrl(e164: string | null | undefined, message?: string): string | null {
  const digits = whatsappNumber(e164);
  if (!digits) return null;
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${query}`;
}
