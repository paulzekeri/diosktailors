import { describe, expect, it } from 'vitest';

import type { Customer, Project } from '@/data/types';
import { activeJobCounts, activeJobLabel, customerCountLabel, sectionByInitial } from '../list';

const customer = (id: string, fullName: string) => ({ id, fullName }) as Customer;
const project = (customerId: string, status: Project['status']) => ({ customerId, status }) as Project;

describe('sectionByInitial', () => {
  it('groups A–Z and puts non-letters under #', () => {
    const sections = sectionByInitial([
      customer('1', 'bola Adeyemi'),
      customer('2', 'Adaeze Okafor'),
      customer('3', 'Chidi Nwosu'),
      customer('4', '2B Tailors'),
      customer('5', 'Bisi Bello'),
    ]);

    expect(sections.map((section) => section.title)).toEqual(['A', 'B', 'C', '#']);
    expect(sections[1].data.map((item) => item.fullName)).toEqual(['Bisi Bello', 'bola Adeyemi']);
    expect(sections[3].data[0].fullName).toBe('2B Tailors');
  });

  it('returns nothing for an empty book', () => {
    expect(sectionByInitial([])).toEqual([]);
  });

  it('sorts defensively even if the input is unsorted', () => {
    const sections = sectionByInitial([customer('1', 'Zara'), customer('2', 'Ada')]);
    expect(sections.map((section) => section.title)).toEqual(['A', 'Z']);
  });
});

describe('activeJobCounts', () => {
  it('counts pending and in-progress jobs per customer', () => {
    const counts = activeJobCounts([
      project('cus_1', 'pending'),
      project('cus_1', 'in_progress'),
      project('cus_1', 'delivered'),
      project('cus_1', 'archived'),
      project('cus_2', 'completed'),
    ]);

    expect(counts).toEqual({ cus_1: 2 });
  });
});

describe('labels', () => {
  it('summarises the list header', () => {
    expect(customerCountLabel(0, '')).toBe('0 customers · sorted A–Z');
    expect(customerCountLabel(1, '')).toBe('1 customer · sorted A–Z');
    expect(customerCountLabel(1, 'bola')).toBe('1 match for “bola”');
    expect(customerCountLabel(3, 'b')).toBe('3 matches for “b”');
  });

  it('pluralises the active-job badge and hides it at zero', () => {
    expect(activeJobLabel(0)).toBeUndefined();
    expect(activeJobLabel(1)).toBe('1 active job');
    expect(activeJobLabel(4)).toBe('4 active jobs');
  });
});
