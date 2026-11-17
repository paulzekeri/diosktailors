import { describe, expect, it } from 'vitest';

import { EMPTY_PROJECT_FORM, toNewProject, toProjectFormValues, validateProjectForm } from '../validation';

const base = { ...EMPTY_PROJECT_FORM, name: 'Wedding gown', expectedDeliveryAt: '2026-12-01' };

function errorsOf(values: typeof base) {
  const result = validateProjectForm(values);
  if (result.success) throw new Error('expected the form to be invalid');
  return result.errors;
}

describe('validateProjectForm', () => {
  it('accepts a name and a real date', () => {
    const result = validateProjectForm(base);
    expect(result.success).toBe(true);
  });

  it('requires a name', () => {
    expect(errorsOf({ ...base, name: ' ' }).name).toBe('Give the job a name');
  });

  it('requires a real delivery date', () => {
    expect(errorsOf({ ...base, expectedDeliveryAt: '' }).expectedDeliveryAt).toBe('Choose a delivery date');
    expect(errorsOf({ ...base, expectedDeliveryAt: '01/12/2026' }).expectedDeliveryAt).toBe('Use the date picker');
    expect(errorsOf({ ...base, expectedDeliveryAt: '2026-02-30' }).expectedDeliveryAt).toBe('That date does not exist');
  });

  it('allows a delivery date in the past — jobs can be logged late', () => {
    expect(validateProjectForm({ ...base, expectedDeliveryAt: '2026-01-05' }).success).toBe(true);
  });

  it('caps the free-text fields', () => {
    expect(errorsOf({ ...base, notes: 'x'.repeat(501) }).notes).toBe('Keep notes under 500 characters');
  });
});

describe('toProjectFormValues (edit prefill)', () => {
  it('round-trips a stored project through the schema', () => {
    const values = toProjectFormValues({
      name: 'Wedding gown',
      expectedDeliveryAt: '2026-12-01',
      description: 'Ivory satin',
      notes: 'Beading only on the bodice',
    });

    expect(values.instructions).toBe('');

    const result = validateProjectForm(values);
    if (!result.success) throw new Error(JSON.stringify(result.errors));
    expect(result.data).toMatchObject({
      name: 'Wedding gown',
      expectedDeliveryAt: '2026-12-01',
      description: 'Ivory satin',
      notes: 'Beading only on the bodice',
    });
  });

  it('fills blanks for everything optional', () => {
    const values = toProjectFormValues({ name: 'Kaftan', expectedDeliveryAt: '2026-11-30' });
    expect(values).toEqual({
      name: 'Kaftan',
      expectedDeliveryAt: '2026-11-30',
      description: '',
      instructions: '',
      notes: '',
    });
  });
});

describe('toNewProject', () => {
  it('defaults the received date to today and drops empty optionals', () => {
    const result = validateProjectForm({ ...base, instructions: '  ' });
    if (!result.success) throw new Error('expected valid');

    const input = toNewProject('cus_1', result.data);
    expect(input.customerId).toBe('cus_1');
    expect(input.name).toBe('Wedding gown');
    expect(input.expectedDeliveryAt).toBe('2026-12-01');
    expect(input.orderReceivedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(input.instructions).toBeUndefined();
    expect(input.description).toBeUndefined();
    expect(input.measurementId).toBeUndefined();
  });

  it('links the measurement version it was created from', () => {
    const result = validateProjectForm(base);
    if (!result.success) throw new Error('expected valid');
    expect(toNewProject('cus_1', result.data, 'mea_9').measurementId).toBe('mea_9');
  });
});
