/**
 * Measurement units and fractions.
 *
 * Templates store inches, but a tailor reads and writes both, and works in
 * eighths of an inch: `32 1/2`, never `32.5`. Everything here is pure so the
 * measurement form, history and compare screens all format values the same way.
 */
import type { Unit } from '@/data/types';

export const CM_PER_INCH = 2.54;

/** Smallest increment a tailor writes. */
export const FRACTION_DENOMINATOR = 8;

export const UNIT_LABEL: Record<Unit, string> = { inches: 'in', cm: 'cm' };

const UNICODE_FRACTIONS: Record<string, string> = {
  '½': ' 1/2',
  '⅓': ' 1/3',
  '⅔': ' 2/3',
  '¼': ' 1/4',
  '¾': ' 3/4',
  '⅕': ' 1/5',
  '⅖': ' 2/5',
  '⅗': ' 3/5',
  '⅘': ' 4/5',
  '⅙': ' 1/6',
  '⅚': ' 5/6',
  '⅛': ' 1/8',
  '⅜': ' 3/8',
  '⅝': ' 5/8',
  '⅞': ' 7/8',
};

const FRACTION_GLYPHS = '[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]';

/** Trailing unit the user may type: `32"`, `32 in`, `81cm`, `81 cm.` */
const UNIT_SUFFIX = /(?:\s*(?:inches|inch|cms|cm|in|"|”|'|′))\.?\s*$/i;

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/** Tap a fraction chip: the value snaps to the nearest eighth (or half centimetre). */
export function roundForUnit(value: number, unit: Unit): number {
  if (unit === 'cm') return round(value * 2, 0) / 2;
  return round(value * FRACTION_DENOMINATOR, 0) / FRACTION_DENOMINATOR;
}

/** Inches ↔ centimetres. Same-unit conversion is a no-op and never drifts. */
export function convert(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  return round(from === 'inches' ? value * CM_PER_INCH : value / CM_PER_INCH, 3);
}

export interface Fraction {
  whole: number;
  numerator: number;
  denominator: number;
}

/** `32.5` → `{ whole: 32, numerator: 1, denominator: 2 }`. Fractions are reduced. */
export function toFraction(value: number, denominator: number = FRACTION_DENOMINATOR): Fraction {
  const safeDenominator = Math.max(1, Math.round(denominator));
  const total = Math.round(Math.abs(value) * safeDenominator);
  const whole = Math.floor(total / safeDenominator);
  const remainder = total - whole * safeDenominator;
  if (remainder === 0) return { whole, numerator: 0, denominator: 1 };
  const divisor = gcd(remainder, safeDenominator);
  return { whole, numerator: remainder / divisor, denominator: safeDenominator / divisor };
}

/** `32.5` → `'32 1/2'` · `32` → `'32'` · `0.5` → `'1/2'`. */
export function formatFraction(value: number, denominator: number = FRACTION_DENOMINATOR): string {
  const { whole, numerator, denominator: reduced } = toFraction(value, denominator);
  if (numerator === 0) return String(whole);
  if (whole === 0) return `${numerator}/${reduced}`;
  return `${whole} ${numerator}/${reduced}`;
}

/** The number without a suffix: inches as a fraction, centimetres to one decimal. */
export function formatMeasurementValue(value: number, unit: Unit): string {
  if (unit === 'cm') {
    const rounded = round(value, 1);
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  }
  return formatFraction(roundForUnit(value, 'inches'));
}

/** Display with suffix: `32 1/2"` · `81.3 cm`. Empty values render as an em dash. */
export function formatMeasurement(value: number | null | undefined, unit: Unit): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return unit === 'inches' ? `${formatMeasurementValue(value, unit)}"` : `${formatMeasurementValue(value, unit)} cm`;
}


/**
 * Parses anything a tailor types into a number, or `null` when it cannot be
 * trusted: `32`, `32.5`, `32,5`, `32 1/2`, `32-1/2`, `32½`, `1/2`, `81 cm`,
 * `32"`. `321/2` is rejected — the digit run must be delimited.
 */
export function parseMeasurement(input: string): number | null {
  if (!input) return null;

  let text = input.trim().toLowerCase();
  if (!text) return null;

  // `32½` → `32 1/2`, then a bare `½` → `1/2`.
  text = text.replace(new RegExp(`(\\d)\\s*(${FRACTION_GLYPHS})`, 'g'), (_match, digit: string, glyph: string) => {
    return `${digit}${UNICODE_FRACTIONS[glyph] ?? glyph}`;
  });
  text = text.replace(new RegExp(FRACTION_GLYPHS, 'g'), (glyph) => (UNICODE_FRACTIONS[glyph] ?? glyph).trim());

  text = text.replace(UNIT_SUFFIX, '').replace(/,/g, '.').trim();
  if (!text) return null;

  // `32 1/2` or `32-1/2`
  const mixed = text.match(/^(\d+(?:\.\d+)?)\s*[-\s]\s*(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const whole = Number(mixed[1]);
    const numerator = Number(mixed[2]);
    const denominator = Number(mixed[3]);
    if (denominator === 0) return null;
    return round(whole + numerator / denominator, 3);
  }

  // `1/2` — proper fractions only, so a typo like `321/2` is rejected rather
  // than read as 160½.
  const fraction = text.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fraction) {
    const numerator = Number(fraction[1]);
    const denominator = Number(fraction[2]);
    if (denominator === 0 || numerator >= denominator) return null;
    return round(numerator / denominator, 3);
  }

  // Plain decimal. Rejects signs, exponents and trailing junk.
  if (!/^\d+(?:\.\d+)?$/.test(text)) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

/** Plausible range for a body measurement, in the given unit. */
export function measurementBounds(unit: Unit): { min: number; max: number } {
  return unit === 'cm' ? { min: 1, max: 300 } : { min: 0.5, max: 120 };
}

export interface MeasurementDelta {
  from: number;
  to: number;
  diff: number;
  direction: 'up' | 'down' | 'same';
}

/** Compare-screen maths. Rounded to 3 decimals so float noise never shows. */
export function measurementDelta(from: number, to: number): MeasurementDelta {
  const diff = round(to - from, 3);
  return { from, to, diff, direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same' };
}

/** `+2`, `−1 1/2`, `0` — sign always shown for non-zero values. */
export function formatDelta(diff: number, unit: Unit): string {
  const rounded = round(diff, 3);
  if (rounded === 0) return '0';
  const magnitude = formatMeasurementValue(Math.abs(rounded), unit);
  return `${rounded > 0 ? '+' : '−'}${magnitude}`;
}

/** Chips under the active field. Tap to replace the fraction part of the value. */
export const FRACTION_CHIPS: ReadonlyArray<{ label: string; numerator: number; denominator: number }> = [
  { label: '⅛', numerator: 1, denominator: 8 },
  { label: '¼', numerator: 1, denominator: 4 },
  { label: '⅜', numerator: 3, denominator: 8 },
  { label: '½', numerator: 1, denominator: 2 },
  { label: '⅝', numerator: 5, denominator: 8 },
  { label: '¾', numerator: 3, denominator: 4 },
  { label: '⅞', numerator: 7, denominator: 8 },
];

/**
 * Applies a fraction chip to whatever the tailor has typed so far:
 * `32` + ½ → `32 1/2`, `32 1/4` + ½ → `32 1/2`, `''` + ½ → `1/2`,
 * `32.5` + ¼ → `32 1/4` (the decimal is dropped, not stacked).
 */
export function addFraction(value: string, numerator: number, denominator: number): string {
  const fraction = `${numerator}/${denominator}`;
  const whole = value.match(/^\s*(\d+)/)?.[1];
  return whole ? `${whole} ${fraction}` : fraction;
}

