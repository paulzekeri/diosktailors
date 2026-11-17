import { describe, expect, it } from 'vitest';

import { STATUS_ORDER, actionsFor, canTransition, daysLate, dueBucket, isOverdue, nextStatuses, pillStatus } from '../status';

/** Every ordered pair, so a future edit to the table cannot quietly open a hole. */
const ALL = STATUS_ORDER;
const LEGAL = new Set([
  'pending>in_progress',
  'in_progress>completed',
  'completed>delivered',
  'completed>in_progress',
  'delivered>archived',
  'archived>in_progress',
]);

describe('canTransition (the whole table)', () => {
  it('matches the legal set exactly — 6 moves out of 25 pairs', () => {
    let legal = 0;
    for (const from of ALL) {
      for (const to of ALL) {
        const allowed = LEGAL.has(`${from}>${to}`);
        expect(canTransition(from, to), `${from} → ${to}`).toBe(allowed);
        if (allowed) legal += 1;
      }
    }
    expect(legal).toBe(LEGAL.size);
  });

  it('never allows a jump over a step', () => {
    expect(canTransition('pending', 'completed')).toBe(false);
    expect(canTransition('in_progress', 'delivered')).toBe(false);
    expect(canTransition('completed', 'archived')).toBe(false);
    expect(canTransition('pending', 'archived')).toBe(false);
  });

  it('keeps archive closed except for the explicit reopen', () => {
    expect(nextStatuses('archived')).toEqual(['in_progress']);
    expect(canTransition('archived', 'pending')).toBe(false);
    expect(canTransition('archived', 'delivered')).toBe(false);
  });

  it('lists the contextual next steps per status', () => {
    expect(nextStatuses('pending')).toEqual(['in_progress']);
    expect(nextStatuses('completed')).toEqual(['delivered', 'in_progress']);
    expect(nextStatuses('delivered')).toEqual(['archived']);
  });
});

describe('actionsFor', () => {
  it('keeps completed and delivered as separate actions', () => {
    const labels = actionsFor('completed').map((action) => action.label);
    expect(labels).toEqual(['Mark delivered', 'Return to in progress']);
    expect(labels).not.toContain('Mark completed');
    expect(actionsFor('in_progress').map((action) => action.label)).toEqual(['Mark completed']);
  });

  it('requires a confirmation for delivered and archive, with the consequence spelled out', () => {
    const delivered = actionsFor('completed')[0];
    expect(delivered.confirm?.message).toMatch(/does not archive/i);

    const archive = actionsFor('delivered')[0];
    expect(archive.to).toBe('archived');
    expect(archive.confirm?.destructive).toBe(true);
    expect(archive.confirm?.message).toMatch(/measurements, photos and history stay/i);
  });

  it('offers reopen as a confirmed secondary action on archived jobs', () => {
    const [reopen] = actionsFor('archived');
    expect(reopen).toMatchObject({ to: 'in_progress', secondary: true });
    expect(reopen.confirm?.title).toMatch(/reopen/i);
  });

  it('marks rework as secondary so it is never the primary button', () => {
    expect(actionsFor('completed')[1]).toMatchObject({ to: 'in_progress', secondary: true });
  });
});

describe('due classification', () => {
  const from = new Date(2026, 10, 17); // 17 Nov 2026

  const project = (expectedDeliveryAt: string, status: 'pending' | 'delivered' = 'pending') =>
    ({ expectedDeliveryAt, status }) as { expectedDeliveryAt: string; status: 'pending' | 'delivered' };

  it('buckets by distance to the promised date', () => {
    expect(dueBucket(project('2026-11-15'), from)).toBe('overdue');
    expect(dueBucket(project('2026-11-17'), from)).toBe('today');
    expect(dueBucket(project('2026-11-20'), from)).toBe('this_week');
    expect(dueBucket(project('2026-12-01'), from)).toBe('later');
  });

  it('never calls a delivered or archived job overdue', () => {
    expect(dueBucket(project('2026-11-01', 'delivered'), from)).toBe('closed');
    expect(isOverdue(project('2026-11-01', 'delivered'), from)).toBe(false);
    expect(daysLate(project('2026-11-01', 'delivered'), from)).toBe(0);
  });

  it('counts whole days late', () => {
    expect(daysLate(project('2026-11-15'), from)).toBe(2);
    expect(daysLate(project('2026-11-17'), from)).toBe(0);
  });

  it('swaps the pill to overdue only when late', () => {
    expect(pillStatus(project('2026-11-15'), from)).toBe('overdue');
    expect(pillStatus(project('2026-11-20'), from)).toBe('pending');
  });
});
