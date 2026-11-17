import { describe, expect, it } from 'vitest';

import {
  convert,
  formatDelta,
  formatFraction,
  formatMeasurement,
  formatMeasurementValue,
  measurementBounds,
  measurementDelta,
  parseMeasurement,
  roundForUnit,
  toFraction,
} from '../units';

describe('convert', () => {
  it('converts inches to centimetres and back without drift', () => {
    expect(convert(32.5, 'inches', 'cm')).toBe(82.55);
    expect(convert(82.55, 'cm', 'inches')).toBe(32.5);
    expect(convert(1, 'inches', 'cm')).toBe(2.54);
    expect(convert(2.54, 'cm', 'inches')).toBe(1);
  });

  it('round-trips every eighth of an inch', () => {
    for (let eighths = 1; eighths <= 96; eighths += 1) {
      const inches = eighths / 8;
      const cm = convert(inches, 'inches', 'cm');
      expect(roundForUnit(convert(cm, 'cm', 'inches'), 'inches')).toBe(inches);
    }
  });

  it('is a no-op for the same unit', () => {
    expect(convert(31.875, 'inches', 'inches')).toBe(31.875);
    expect(convert(81, 'cm', 'cm')).toBe(81);
  });
});

describe('roundForUnit', () => {
  it('snaps inches to the nearest eighth', () => {
    expect(roundForUnit(32.44, 'inches')).toBe(32.5);
    expect(roundForUnit(32.18, 'inches')).toBe(32.125);
    expect(roundForUnit(32, 'inches')).toBe(32);
  });

  it('snaps centimetres to the nearest half', () => {
    expect(roundForUnit(82.3, 'cm')).toBe(82.5);
    expect(roundForUnit(82.1, 'cm')).toBe(82);
  });
});

describe('fractions', () => {
  it('reduces to the fraction a tailor writes', () => {
    expect(toFraction(32.5)).toEqual({ whole: 32, numerator: 1, denominator: 2 });
    expect(toFraction(33.75)).toEqual({ whole: 33, numerator: 3, denominator: 4 });
    expect(toFraction(31.875)).toEqual({ whole: 31, numerator: 7, denominator: 8 });
    expect(toFraction(32)).toEqual({ whole: 32, numerator: 0, denominator: 1 });
  });

  it('formats whole numbers, fractions and mixed numbers', () => {
    expect(formatFraction(32)).toBe('32');
    expect(formatFraction(32.5)).toBe('32 1/2');
    expect(formatFraction(31.875)).toBe('31 7/8');
    expect(formatFraction(0.5)).toBe('1/2');
  });
});

describe('formatMeasurement', () => {
  it('formats inches as fractions with a quote', () => {
    expect(formatMeasurement(32.5, 'inches')).toBe('32 1/2"');
    expect(formatMeasurement(32, 'inches')).toBe('32"');
  });

  it('formats centimetres with one decimal, dropping a trailing .0', () => {
    expect(formatMeasurement(81.3, 'cm')).toBe('81.3 cm');
    expect(formatMeasurement(82.55, 'cm')).toBe('82.6 cm');
    expect(formatMeasurement(81, 'cm')).toBe('81 cm');
  });

  it('renders a dash for missing values', () => {
    expect(formatMeasurement(null, 'inches')).toBe('—');
    expect(formatMeasurement(undefined, 'cm')).toBe('—');
    expect(formatMeasurement(Number.NaN, 'cm')).toBe('—');
    expect(formatMeasurementValue(31.9, 'inches')).toBe('31 7/8');
  });
});

describe('parseMeasurement', () => {
  it('accepts plain decimals, including a comma decimal', () => {
    expect(parseMeasurement('32')).toBe(32);
    expect(parseMeasurement('32.5')).toBe(32.5);
    expect(parseMeasurement('32,5')).toBe(32.5);
    expect(parseMeasurement(' 81 ')).toBe(81);
  });

  it('accepts the fraction forms tailors use', () => {
    expect(parseMeasurement('32 1/2')).toBe(32.5);
    expect(parseMeasurement('32-1/2')).toBe(32.5);
    expect(parseMeasurement('32½')).toBe(32.5);
    expect(parseMeasurement('1/2')).toBe(0.5);
    expect(parseMeasurement('½')).toBe(0.5);
    expect(parseMeasurement('31 7/8')).toBe(31.875);
  });

  it('strips typed units', () => {
    expect(parseMeasurement('32"')).toBe(32);
    expect(parseMeasurement('32 in')).toBe(32);
    expect(parseMeasurement('32 in.')).toBe(32);
    expect(parseMeasurement('81 cm')).toBe(81);
    expect(parseMeasurement('81cm')).toBe(81);
  });

  it('rejects anything ambiguous or out of range of sanity', () => {
    expect(parseMeasurement('')).toBeNull();
    expect(parseMeasurement('   ')).toBeNull();
    expect(parseMeasurement('abc')).toBeNull();
    expect(parseMeasurement('-5')).toBeNull();
    expect(parseMeasurement('32..5')).toBeNull();
    expect(parseMeasurement('1/0')).toBeNull();
    expect(parseMeasurement('321/2')).toBeNull();
    expect(parseMeasurement('32 1/2 3')).toBeNull();
  });
});

describe('bounds and deltas', () => {
  it('gives a plausible range per unit', () => {
    expect(measurementBounds('inches')).toEqual({ min: 0.5, max: 120 });
    expect(measurementBounds('cm')).toEqual({ min: 1, max: 300 });
  });

  it('classifies direction without float noise', () => {
    expect(measurementDelta(32, 34)).toMatchObject({ diff: 2, direction: 'up' });
    expect(measurementDelta(34, 32)).toMatchObject({ diff: -2, direction: 'down' });
    expect(measurementDelta(32, 32).direction).toBe('same');
    expect(measurementDelta(32.1, 32.2).diff).toBe(0.1);
  });

  it('formats deltas with a sign', () => {
    expect(formatDelta(2, 'inches')).toBe('+2');
    expect(formatDelta(-1.5, 'inches')).toBe('−1 1/2');
    expect(formatDelta(1.5, 'cm')).toBe('+1.5');
    expect(formatDelta(0, 'cm')).toBe('0');
  });
});
