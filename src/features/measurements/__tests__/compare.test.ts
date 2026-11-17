import { describe, expect, it } from 'vitest';

import { WOMEN_FIELDS } from '@/data/templates';
import { changedRows, compareSummary, compareVersions, summaryLabel } from '../compare';

const v2 = {
  data: {
    neck: 14,
    shoulder: 15.5,
    bust: 38,
    under_bust: 32,
    waist: 32.5,
    hip: 41,
  } as Record<string, number | null>,
  unit: 'inches' as const,
};

const v3 = {
  data: {
    neck: 14,
    shoulder: 15.5,
    bust: 38,
    under_bust: 32,
    waist: 34,
    hip: 41,
    gown_length: 58,
  } as Record<string, number | null>,
  unit: 'inches' as const,
};

describe('compareVersions', () => {
  const rows = compareVersions({ fields: WOMEN_FIELDS, from: v2, to: v3 });

  it('returns every field in template order, so 18 fields stay readable', () => {
    expect(rows).toHaveLength(18);
    expect(rows[0].fieldId).toBe('neck');
    expect(rows[1].fieldId).toBe('shoulder');
  });

  it('marks moved, new, unchanged and missing fields distinctly', () => {
    const byId = Object.fromEntries(rows.map((row) => [row.fieldId, row]));
    expect(byId.waist.note).toBe('changed');
    expect(byId.waist.delta?.diff).toBe(1.5);
    expect(byId.waist.changed).toBe(true);
    expect(byId.gown_length.note).toBe('new');
    expect(byId.gown_length.from).toBeNull();
    expect(byId.neck.note).toBe('same');
    expect(byId.neck.changed).toBe(false);
    expect(byId.sleeve_length.note).toBe('missing');
  });

  it('labels a cleared field instead of reporting a fake delta', () => {
    const cleared = compareVersions({
      fields: WOMEN_FIELDS,
      from: v2,
      to: { data: { ...v2.data, waist: null }, unit: 'inches' },
    });
    const waist = cleared.find((row) => row.fieldId === 'waist');
    expect(waist).toMatchObject({ note: 'removed', to: null, delta: null, changed: true });
  });

  it('normalises a unit switch before diffing', () => {
    const switched = compareVersions({
      fields: WOMEN_FIELDS,
      from: v2,
      to: { data: { ...v3.data, waist: 86.36 }, unit: 'cm' },
      displayUnit: 'inches',
    });
    const waist = switched.find((row) => row.fieldId === 'waist');
    // 86.36 cm ≈ 34 in, so the real change is +1.5 in, not +54.36
    expect(waist?.to).toBe(34);
    expect(waist?.delta?.diff).toBe(1.5);
    expect(waist?.note).toBe('changed');
  });

  it('displays in centimetres when asked, keeping the delta honest', () => {
    const inCm = compareVersions({ fields: WOMEN_FIELDS, from: v2, to: v3, displayUnit: 'cm' });
    const waist = inCm.find((row) => row.fieldId === 'waist');
    expect(waist?.to).toBe(86.36);
    expect(waist?.delta?.diff).toBe(3.81);
  });

  it('defaults to the newer version’s unit', () => {
    const cmVersion = compareVersions({
      fields: WOMEN_FIELDS,
      from: v2,
      to: { data: { ...v3.data, waist: 86.36 }, unit: 'cm' },
    });
    const waist = cmVersion.find((row) => row.fieldId === 'waist');
    expect(waist?.from).toBe(82.55);
    expect(waist?.to).toBe(86.36);
    expect(waist?.delta?.diff).toBe(3.81);
  });
});

describe('summaries', () => {
  const rows = compareVersions({ fields: WOMEN_FIELDS, from: v2, to: v3 });

  it('counts each kind of change', () => {
    const summary = compareSummary(rows);
    expect(summary.total).toBe(18);
    expect(summary.changed).toBe(1);
    expect(summary.added).toBe(1);
    expect(summary.removed).toBe(0);
    // Both versions only carry the upper-body block, so 11 fields are blank in each.
    expect(summary.missing).toBe(11);
  });

  it('writes the headline a tailor can scan', () => {
    expect(summaryLabel(compareSummary(rows))).toBe('1 changed · 1 new');
    expect(summaryLabel(compareSummary(compareVersions({ fields: WOMEN_FIELDS, from: v2, to: v2 })))).toBe(
      'No differences',
    );
  });

  it('filters to changed rows only', () => {
    expect(changedRows(rows).map((row) => row.fieldId)).toEqual(['waist', 'gown_length']);
  });
});
