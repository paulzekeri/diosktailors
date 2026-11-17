/**
 * Template validation (screens 31/32). Field labels are wording, ids are
 * identity — so the rules here only police names, never keys.
 */
import { z } from 'zod';

import type { TemplateField } from '@/data/types';
import { zodFieldErrors, type FieldErrors } from '@/lib/forms';
import { FIELD_LABEL_MAX, duplicateLabel } from './fields';

const GROUP_VALUES = ['upper', 'lower', 'length', 'custom'] as const;

export const newFieldSchema = z.object({
  label: z
    .string()
    .trim()
    .min(2, 'Give the field a name')
    .max(FIELD_LABEL_MAX, `Keep the name under ${FIELD_LABEL_MAX} characters`),
  group: z.enum(GROUP_VALUES),
});

export type NewFieldValues = z.input<typeof newFieldSchema>;

export function validateNewField(
  fields: TemplateField[],
  values: NewFieldValues,
): { success: true; data: z.output<typeof newFieldSchema> } | { success: false; errors: FieldErrors } {
  const result = newFieldSchema.safeParse(values);
  if (!result.success) return { success: false, errors: zodFieldErrors(result.error) };

  const clash = duplicateLabel(fields, result.data.label);
  if (clash) {
    return { success: false, errors: { label: `“${clash.label}” is already a field` } };
  }
  return { success: true, data: result.data };
}

export function validateRename(
  fields: TemplateField[],
  id: string,
  label: string,
): { success: true; label: string } | { success: false; errors: FieldErrors } {
  const result = newFieldSchema.shape.label.safeParse(label);
  if (!result.success) return { success: false, errors: zodFieldErrors(result.error as z.ZodError) };

  const clash = duplicateLabel(fields, result.data, id);
  if (clash) return { success: false, errors: { label: `“${clash.label}” is already a field` } };

  return { success: true, label: result.data };
}

export const templateNameSchema = z
  .string()
  .trim()
  .min(2, 'Give the template a name')
  .max(60, 'Keep the name under 60 characters');

/** A template is only saveable with a name and at least one field. */
export function validateTemplate(name: string, fields: TemplateField[]):
  | { success: true; name: string }
  | { success: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const parsed = templateNameSchema.safeParse(name);
  if (parsed.success) {
    // nothing yet
  } else {
    errors.name = parsed.error.issues[0]?.message ?? 'Enter a template name';
  }

  if (fields.length === 0) errors.fields = 'A template needs at least one field';

  if (Object.keys(errors).length > 0) return { success: false, errors };
  return { success: true, name: (name ?? '').trim() };
}
