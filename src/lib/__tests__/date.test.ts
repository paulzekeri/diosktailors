import { describe, expect, it } from 'vitest';

import { addDaysISO, daysUntil, dueLabel, nextOccurrence, parseISODate, toISODate } from '../date';

const fixed = new Date(2026, 10, 14); // 14 Nov 2026 (local)

describe('parseISODate', () => {
  it('parses a date-only string without timezone drift', () => {
    const parsed = parseISODate('2026-11-14');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(10);
    expect(parsed.getDate()).toBe(14);
  });

  it('tolerates full ISO timestamps', () => {
    expect(toISODate(parseISODate('2026-11-14T09:00:00.000Z'))).toBe('2026-11-14');
  });
});

describe('daysUntil', () => {
  it('returns 0 for today', () => {
    expect(daysUntil('2026-11-14', fixed)).toBe(0);
  });

  it('returns a negative number when overdue', () => {
    expect(daysUntil('2026-11-12', fixed)).toBe(-2);
  });

  it('counts forward across a month boundary', () => {
    expect(daysUntil('2026-12-01', fixed)).toBe(17);
  });
});

describe('dueLabel', () => {
  it('describes overdue, today, tomorrow and later', () => {
    expect(dueLabel(-2)).toBe('Overdue by 2 days');
    expect(dueLabel(-1)).toBe('Overdue by 1 day');
    expect(dueLabel(0)).toBe('Today');
    expect(dueLabel(1)).toBe('Tomorrow');
    expect(dueLabel(5)).toBe('In 5 days');
  });
});

describe('nextOccurrence', () => {
  it('returns this year when the date is still ahead', () => {
    expect(toISODate(nextOccurrence('1990-12-25', fixed))).toBe('2026-12-25');
  });

  it('rolls to next year when the date has passed', () => {
    expect(toISODate(nextOccurrence('1990-03-01', fixed))).toBe('2027-03-01');
  });

  it('treats today as the occurrence', () => {
    expect(toISODate(nextOccurrence('1990-11-14', fixed))).toBe('2026-11-14');
  });
});

describe('addDaysISO', () => {
  it('adds and subtracts days', () => {
    expect(addDaysISO(3, fixed)).toBe('2026-11-17');
    expect(addDaysISO(-14, fixed)).toBe('2026-10-31');
  });
});
