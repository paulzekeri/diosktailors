import { describe, expect, it } from 'vitest';

import { WOMEN_FIELDS } from '@/data/templates';
import {
  changedFieldIds,
  convertDraft,
  draftFromValues,
  groupFields,
  measurementProgress,
  parseFieldValue,
  validateMeasurement,
  validateFieldValue,
} from '../validation';

const requiredDraft = { neck: '14', shoulder: '16', bust: '36', under_bust: '31', waist: '32 1/2', hip: '40' };

describe('groupFields', () => {
  it('splits the standard template into display order', () => {
    const sections = groupFields(WOMEN_FIELDS);
    expect(sections.map((s) => s.label)).toEqual(['Upper body', 'Lower body', 'Lengths']);
    expect(sections[0].fields[0].id).toBe('neck');
  });

  it('drops empty groups', () => {
    expect(groupFields([])).toEqual([]);
  });
});

describe('parseFieldValue', () => {
  it('reads fractions and snaps to the unit step', () => {
    expect(parseFieldValue('32 1/2', 'inches')).toBe(32.5);
    expect(parseFieldValue('32½', 'inches')).toBe(32.5);
    expect(parseFieldValue('32.44', 'inches')).toBe(32.5);
    expect(parseFieldValue('82.3', 'cm')).toBe(82.5);
  });

  it('treats empty and junk as no value', () => {
    expect(parseFieldValue('', 'inches')).toBeNull();
    expect(parseFieldValue(undefined, 'inches')).toBeNull();
    expect(parseFieldValue('abc', 'inches')).toBeNull();
  });
});

describe('validateFieldValue', () => {
  const neck = WOMEN_FIELDS[0];

  it('enforces required fields with the field name in the message', () => {
    expect(validateFieldValue(neck, '', 'inches')).toBe('Enter neck');
  });

  it('accepts an empty optional field', () => {
    const optional = WOMEN_FIELDS.find((field) => !field.required);
    expect(optional).toBeDefined();
    expect(validateFieldValue(optional!, '', 'inches')).toBeUndefined();
  });

  it('rejects text it cannot read and values outside a body-plausible range', () => {
    expect(validateFieldValue(neck, 'abc', 'inches')).toBe('Enter a number, e.g. 32 or 32 1/2');
    expect(validateFieldValue(neck, '130', 'inches')).toBe('Use 0.5–120 in');
    expect(validateFieldValue(neck, '0.5', 'cm')).toBe('Use 1–300 cm');
    expect(validateFieldValue(neck, '60', 'cm')).toBeUndefined();
  });
});

describe('validateMeasurement', () => {
  it('counts what is missing rather than failing on the first field', () => {
    const result = validateMeasurement(WOMEN_FIELDS, {}, 'inches');
    expect(result.filled).toBe(0);
    expect(result.total).toBe(18);
    expect(result.requiredMissing).toBe(6);
    expect(result.valid).toBe(false);
    expect(result.errors.neck).toBe('Enter neck');
  });

  it('is valid once the required fields parse', () => {
    const result = validateMeasurement(WOMEN_FIELDS, requiredDraft, 'inches');
    expect(result.errors.waist).toBeUndefined();
    expect(result.values.waist).toBe(32.5);
    expect(result.values.hip).toBe(40);
    expect(result.values.gown_length).toBeNull();
    expect(result.filled).toBe(6);
    expect(result.requiredMissing).toBe(0);
    expect(result.valid).toBe(true);
  });

  it('keeps a per-field error and is not valid when a required field is junk', () => {
    const result = validateMeasurement(WOMEN_FIELDS, { ...requiredDraft, waist: '3/2/1' }, 'inches');
    expect(result.errors.waist).toBe('Enter a number, e.g. 32 or 32 1/2');
    expect(result.requiredMissing).toBe(1);
    expect(result.valid).toBe(false);
  });
});

describe('measurementProgress', () => {
  it('reports filled over total', () => {
    expect(measurementProgress(WOMEN_FIELDS, { neck: 14, waist: 32 })).toMatchObject({ filled: 2, total: 18 });
    expect(measurementProgress(WOMEN_FIELDS, {}).ratio).toBe(0);
  });
});

describe('convertDraft', () => {
  it('re-expresses typed values when the unit toggle moves', () => {
    expect(convertDraft({ waist: '32 1/2' }, 'inches', 'cm')).toEqual({ waist: '82.6' });
    expect(convertDraft({ waist: '82.55' }, 'cm', 'inches')).toEqual({ waist: '32 1/2' });
  });

  it('leaves junk alone instead of wiping it', () => {
    expect(convertDraft({ waist: 'abc' }, 'inches', 'cm')).toEqual({ waist: 'abc' });
    expect(convertDraft({ waist: '' }, 'inches', 'cm')).toEqual({ waist: '' });
  });

  it('is a no-op for the same unit', () => {
    const draft = { waist: '32 1/2' };
    expect(convertDraft(draft, 'inches', 'inches')).toBe(draft);
  });
});

describe('changedFieldIds', () => {
  it('reports added, removed and moved fields', () => {
    expect(changedFieldIds({ waist: 32 }, { waist: 34, hip: 40 })).toEqual(['waist', 'hip']);
    expect(changedFieldIds({ waist: 32, hip: 40 }, { waist: 32 })).toEqual([]);
  });

  it('ignores float noise', () => {
    expect(changedFieldIds({ waist: 32.0000001 }, { waist: 32 })).toEqual([]);
  });
});

describe('draftFromValues', () => {
  it('pre-fills a draft with the current version for one-tap reuse', () => {
    expect(draftFromValues(WOMEN_FIELDS, { neck: 14, waist: 32.5 }, 'inches')).toMatchObject({
      neck: '14',
      waist: '32 1/2',
      hip: '',
    });
  });
});
