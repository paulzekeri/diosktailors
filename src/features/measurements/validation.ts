/**
 * Measurement entry logic — the hero screen (design plan §4.6).
 *
 * Rows hold raw text (fractions allowed: `32 1/2`, `32½`); this module parses,
 * range-checks, counts progress and converts a draft when the unit toggle moves.
 * Pure functions only, so the entry form, history and compare screens agree.
 */
import type { FieldGroup, TemplateField, Unit } from '@/data/types';
import { convert, formatMeasurementValue, measurementBounds, parseMeasurement, roundForUnit } from '@/lib/units';

export type MeasurementValues = Record<string, number | null>;
export type MeasurementDraft = Record<string, string>;
export type MeasurementErrors = Record<string, string | undefined>;

/** Display order of the entry form's groups. */
export const FIELD_GROUPS: ReadonlyArray<{ group: FieldGroup; label: string }> = [
  { group: 'upper', label: 'Upper body' },
  { group: 'lower', label: 'Lower body' },
  { group: 'length', label: 'Lengths' },
  { group: 'custom', label: 'Custom' },
];

export interface FieldSection {
  group: FieldGroup;
  label: string;
  fields: TemplateField[];
}

/** Groups in display order, field order respected, empty groups dropped. */
export function groupFields(fields: TemplateField[]): FieldSection[] {
  return FIELD_GROUPS.map(({ group, label }) => ({
    group,
    label,
    fields: fields.filter((field) => field.group === group).sort((a, b) => a.order - b.order),
  })).filter((section) => section.fields.length > 0);
}

const unitSuffix = (unit: Unit) => (unit === 'cm' ? 'cm' : 'in');

const boundsCopy = (unit: Unit) => {
  const { min, max } = measurementBounds(unit);
  return `Use ${min}–${max} ${unitSuffix(unit)}`;
};

/** Empty stays empty; anything unparseable is `null` (the error is separate). */
export function parseFieldValue(raw: string | undefined, unit: Unit): number | null {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) return null;
  const parsed = parseMeasurement(trimmed);
  return parsed === null ? null : roundForUnit(parsed, unit);
}

export function validateFieldValue(field: TemplateField, raw: string | undefined, unit: Unit): string | undefined {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) return field.required ? `Enter ${field.label.toLowerCase()}` : undefined;

  const parsed = parseMeasurement(trimmed);
  if (parsed === null) return 'Enter a number, e.g. 32 or 32 1/2';

  const { min, max } = measurementBounds(unit);
  if (parsed < min || parsed > max) return boundsCopy(unit);
  return undefined;
}

export interface MeasurementValidation {
  errors: MeasurementErrors;
  values: MeasurementValues;
  /** Fields with a usable number — the "12 of 18 filled" counter. */
  filled: number;
  total: number;
  requiredMissing: number;
  valid: boolean;
}

export function validateMeasurement(
  fields: TemplateField[],
  draft: MeasurementDraft,
  unit: Unit,
): MeasurementValidation {
  const errors: MeasurementErrors = {};
  const values: MeasurementValues = {};
  let filled = 0;
  let requiredMissing = 0;

  for (const field of fields) {
    const raw = draft[field.id];
    errors[field.id] = validateFieldValue(field, raw, unit);
    const value = parseFieldValue(raw, unit);
    values[field.id] = value;
    if (value !== null) filled += 1;
    else if (field.required) requiredMissing += 1;
  }

  return {
    errors,
    values,
    filled,
    total: fields.length,
    requiredMissing,
    valid: requiredMissing === 0 && !Object.values(errors).some(Boolean),
  };
}

/** Progress bar + "12 of 18 filled" label. */
export function measurementProgress(fields: TemplateField[], values: MeasurementValues) {
  const total = fields.length;
  const filled = fields.filter((field) => values[field.id] !== null && values[field.id] !== undefined).length;
  return { filled, total, ratio: total === 0 ? 0 : filled / total };
}

/** Unit toggle: what is already typed is re-expressed, not thrown away. */
export function convertDraft(draft: MeasurementDraft, from: Unit, to: Unit): MeasurementDraft {
  if (from === to) return draft;
  const next: MeasurementDraft = {};
  for (const [id, raw] of Object.entries(draft)) {
    const parsed = parseMeasurement(raw ?? '');
    next[id] = parsed === null ? (raw ?? '') : formatMeasurementValue(convert(parsed, from, to), to);
  }
  return next;
}

/** Compare screen: which fields actually moved between two versions. */
export function changedFieldIds(previous: MeasurementValues, next: MeasurementValues): string[] {
  return Object.keys(next).filter((id) => {
    const before = previous[id] ?? null;
    const after = next[id] ?? null;
    if (before === null && after === null) return false;
    if (before === null || after === null) return true;
    return Math.abs(before - after) > 0.0001;
  });
}

/** A draft pre-filled from the current version — "same as last time" in one tap. */
export function draftFromValues(fields: TemplateField[], values: MeasurementValues, unit: Unit): MeasurementDraft {
  const draft: MeasurementDraft = {};
  for (const field of fields) {
    const value = values[field.id];
    draft[field.id] = typeof value === 'number' ? formatMeasurementValue(value, unit) : '';
  }
  return draft;
}
