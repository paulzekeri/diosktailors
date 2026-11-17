/**
 * Template field maths. The rule this module exists to protect: **a field's `id`
 * is permanent and a rename only changes `label`**, so saved measurements can
 * never be orphaned. Custom fields get a stable `custom_<slug>` id.
 */
import type { FieldGroup, TemplateField, Unit } from '@/data/types';

export const FIELD_LABEL_MAX = 40;
const CUSTOM_PREFIX = 'custom_';

export function slugifyLabel(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return slug || 'field';
}

/** Stable id for a new custom field: `custom_<slug>`, then `_2`, `_3`… on collision. */
export function customFieldId(fields: TemplateField[], label: string): string {
  const base = `${CUSTOM_PREFIX}${slugifyLabel(label)}`;
  if (!fields.some((field) => field.id === base)) return base;

  let attempt = 2;
  while (fields.some((field) => field.id === `${base}_${attempt}`)) attempt += 1;
  return `${base}_${attempt}`;
}

export function nextOrder(fields: TemplateField[]): number {
  return fields.reduce((max, field) => Math.max(max, field.order), 0) + 1;
}

export function orderedFields(fields: TemplateField[]): TemplateField[] {
  return [...fields].sort((a, b) => a.order - b.order);
}

export interface NewFieldInput {
  label: string;
  group: FieldGroup;
  type?: 'number' | 'text';
  unit?: Unit;
  required?: boolean;
}

export function createField(fields: TemplateField[], input: NewFieldInput): TemplateField {
  return {
    id: customFieldId(fields, input.label),
    label: input.label.trim(),
    group: input.group,
    type: input.type ?? 'number',
    unit: input.unit,
    required: input.required ?? false,
    order: nextOrder(fields),
  };
}

/** Rename only. The id never moves — that is the history guarantee, in one line. */
export function renameField(fields: TemplateField[], id: string, label: string): TemplateField[] {
  return fields.map((field) => (field.id === id ? { ...field, label: label.trim() } : field));
}

export function setFieldRequired(fields: TemplateField[], id: string, required: boolean): TemplateField[] {
  return fields.map((field) => (field.id === id ? { ...field, required } : field));
}

/** Swaps a field with its neighbour and renumbers, so order stays 1..n with no gaps. */
export function moveField(fields: TemplateField[], id: string, direction: -1 | 1): TemplateField[] {
  const ordered = orderedFields(fields);
  const index = ordered.findIndex((field) => field.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= ordered.length) return fields;

  const swapped = [...ordered];
  const moved = swapped[index];
  swapped[index] = swapped[target];
  swapped[target] = moved;

  return swapped.map((field, position) => ({ ...field, order: position + 1 }));
}

export function removeField(fields: TemplateField[], id: string): TemplateField[] {
  return orderedFields(fields)
    .filter((field) => field.id !== id)
    .map((field, position) => ({ ...field, order: position + 1 }));
}

/** Ids that already hold a value in at least one saved version. */
export function fieldsWithValues(
  fields: TemplateField[],
  versions: ReadonlyArray<{ data: Record<string, unknown> }>,
): string[] {
  const used = new Set<string>();
  for (const version of versions) {
    for (const [id, value] of Object.entries(version.data)) {
      if (value !== null && value !== undefined && value !== '') used.add(id);
    }
  }
  return fields.filter((field) => used.has(field.id)).map((field) => field.id);
}

/** Case-insensitive duplicate check, ignoring the field being edited. */
export function duplicateLabel(
  fields: TemplateField[],
  label: string,
  exceptId?: string,
): TemplateField | undefined {
  const target = label.trim().toLowerCase();
  return fields.find((field) => field.id !== exceptId && field.label.trim().toLowerCase() === target);
}
