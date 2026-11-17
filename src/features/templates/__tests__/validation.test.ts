import { describe, expect, it } from 'vitest';

import { WOMEN_FIELDS } from '@/data/templates';
import { validateNewField, validateRename, validateTemplate } from '../validation';

describe('validateNewField', () => {
  it('accepts a fresh custom name', () => {
    const result = validateNewField(WOMEN_FIELDS, { label: '  Head circumference ', group: 'upper' });
    if (!result.success) throw new Error(JSON.stringify(result.errors));
    expect(result.data.label).toBe('Head circumference');
  });

  it('rejects an empty, single-letter or overlong name', () => {
    expect(validateNewField(WOMEN_FIELDS, { label: ' ', group: 'upper' }).success).toBe(false);

    const short = validateNewField(WOMEN_FIELDS, { label: 'H', group: 'upper' });
    expect(short.success).toBe(false);
    if (!short.success) expect(short.errors.label).toBe('Give the field a name');

    const long = validateNewField(WOMEN_FIELDS, { label: 'x'.repeat(41), group: 'upper' });
    expect(long.success).toBe(false);
    if (!long.success) expect(long.errors.label).toBe('Keep the name under 40 characters');
  });

  it('refuses a name the template already uses, ignoring case', () => {
    const clash = validateNewField(WOMEN_FIELDS, { label: ' waist ', group: 'upper' });
    expect(clash.success).toBe(false);
    if (!clash.success) expect(clash.errors.label).toBe('“Waist” is already a field');
  });
});

describe('validateRename', () => {
  it('allows renaming a field to a clearer name', () => {
    const result = validateRename(WOMEN_FIELDS, 'waist', 'Waist (natural)');
    expect(result).toEqual({ success: true, label: 'Waist (natural)' });
  });

  it('refuses a name another field already has', () => {
    const result = validateRename(WOMEN_FIELDS, 'waist', 'Hip');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.errors.label).toBe('“Hip” is already a field');
  });

  it('lets a field keep its own name', () => {
    expect(validateRename(WOMEN_FIELDS, 'waist', 'Waist')).toEqual({ success: true, label: 'Waist' });
  });
});

describe('validateTemplate', () => {
  it('requires a name and at least one field', () => {
    const noName = validateTemplate(' ', WOMEN_FIELDS);
    expect(noName.success).toBe(false);
    if (!noName.success) expect(noName.errors.name).toBe('Give the template a name');

    const noFields = validateTemplate('Studio template', []);
    expect(noFields.success).toBe(false);
    if (!noFields.success) expect(noFields.errors.fields).toBe('A template needs at least one field');
  });

  it('accepts a named template with fields', () => {
    expect(validateTemplate('  Studio template ', WOMEN_FIELDS)).toEqual({ success: true, name: 'Studio template' });
  });
});
