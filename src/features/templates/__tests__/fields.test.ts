import { describe, expect, it } from 'vitest';

import { WOMEN_FIELDS } from '@/data/templates';
import type { TemplateField } from '@/data/types';
import {
  createField,
  customFieldId,
  duplicateLabel,
  fieldsWithValues,
  moveField,
  orderedFields,
  removeField,
  renameField,
  setFieldRequired,
  slugifyLabel,
} from '../fields';

const custom = (id: string, label: string, order: number): TemplateField => ({
  id,
  label,
  group: 'custom',
  type: 'number',
  order,
});

describe('ids', () => {
  it('slugs a label for use inside an id', () => {
    expect(slugifyLabel('Head circumference')).toBe('head_circumference');
    expect(slugifyLabel('  Thigh (left) ')).toBe('thigh_left');
    expect(slugifyLabel('!!!')).toBe('field');
  });

  it('never collides with an existing field id', () => {
    const fields = [custom('custom_head', 'Head', 1), custom('custom_head_2', 'Head', 2)];
    expect(customFieldId(fields, 'Head')).toBe('custom_head_3');
  });

  it('creates a field with a custom id, the next order and sensible defaults', () => {
    const field = createField([custom('a', 'A', 1)], { label: 'Head circumference', group: 'upper' });
    expect(field).toMatchObject({
      id: 'custom_head_circumference',
      label: 'Head circumference',
      group: 'upper',
      type: 'number',
      required: false,
      order: 2,
    });
  });
});

describe('renameField', () => {
  it('changes the label and NOTHING else — the history guarantee', () => {
    const [waist] = WOMEN_FIELDS.filter((field) => field.id === 'waist');
    const renamed = renameField(WOMEN_FIELDS, 'waist', '  Waist (natural) ');
    const after = renamed.find((field) => field.id === 'waist');

    expect(after?.label).toBe('Waist (natural)');
    expect(after?.id).toBe('waist');
    expect(after?.group).toBe(waist.group);
    expect(after?.order).toBe(waist.order);
    expect(renamed.filter((field) => field.id === 'waist')).toHaveLength(1);
  });

  it('leaves every other field untouched', () => {
    const renamed = renameField(WOMEN_FIELDS, 'waist', 'Waist');
    expect(renamed.find((field) => field.id === 'neck')).toEqual(WOMEN_FIELDS.find((field) => field.id === 'neck'));
  });
});

describe('ordering', () => {
  const fields = [custom('a', 'A', 1), custom('b', 'B', 2), custom('c', 'C', 3)];

  it('moves a field up and renumbers without gaps', () => {
    const moved = moveField(fields, 'c', -1);
    expect(orderedFields(moved).map((field) => field.id)).toEqual(['a', 'c', 'b']);
    expect(moved.map((field) => field.order).sort()).toEqual([1, 2, 3]);
  });

  it('ignores a move past either end', () => {
    expect(moveField(fields, 'a', -1)).toBe(fields);
    expect(moveField(fields, 'c', 1)).toBe(fields);
  });

  it('removes a field and closes the gap', () => {
    expect(removeField(fields, 'b').map((field) => [field.id, field.order])).toEqual([
      ['a', 1],
      ['c', 2],
    ]);
  });

  it('toggles required without touching the id', () => {
    const [toggled] = setFieldRequired([custom('a', 'A', 1)], 'a', true);
    expect(toggled).toMatchObject({ id: 'a', required: true });
  });
});

describe('duplicates and existing values', () => {
  it('finds a duplicate label case-insensitively, ignoring the edited field', () => {
    const fields = [custom('a', 'Waist', 1), custom('b', 'Hip', 2)];
    expect(duplicateLabel(fields, ' waist ')?.id).toBe('a');
    expect(duplicateLabel(fields, 'Waist', 'a')).toBeUndefined();
    expect(duplicateLabel(fields, 'Bust')).toBeUndefined();
  });

  it('reports which fields already hold values in saved versions', () => {
    const fields = [custom('waist', 'Waist', 1), custom('head', 'Head', 2)];
    const versions = [{ data: { waist: 32.5, head: null } }, { data: { waist: null } }];
    expect(fieldsWithValues(fields, versions)).toEqual(['waist']);
    expect(fieldsWithValues(fields, [])).toEqual([]);
  });
});
