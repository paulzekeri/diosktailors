/**
 * Version comparison (§4.6.6). Both versions are normalised into one display
 * unit before diffing, so a value recorded in inches and later in centimetres
 * compares correctly instead of producing a bogus delta.
 */
import type { Measurement, TemplateField, Unit } from '@/data/types';
import { convert, measurementDelta, type MeasurementDelta } from '@/lib/units';

export type CompareNote = 'changed' | 'same' | 'new' | 'removed' | 'missing';

export interface CompareRow {
  fieldId: string;
  label: string;
  /** Values in the display unit, or null when the version had no reading. */
  from: number | null;
  to: number | null;
  delta: MeasurementDelta | null;
  changed: boolean;
  note: CompareNote;
}

export interface CompareInput {
  fields: TemplateField[];
  from: { data: Measurement['data']; unit: Unit };
  to: { data: Measurement['data']; unit: Unit };
  /** Defaults to the newer version's unit. */
  displayUnit?: Unit;
}

function asNumber(value: Measurement['data'][string]): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalise(value: Measurement['data'][string], from: Unit, to: Unit): number | null {
  const parsed = asNumber(value);
  return parsed === null ? null : Math.round(convert(parsed, from, to) * 1000) / 1000;
}

export function compareVersions({ fields, from, to, displayUnit }: CompareInput): CompareRow[] {
  const unit = displayUnit ?? to.unit;

  return [...fields]
    .sort((a, b) => a.order - b.order)
    .map((field) => {
      const before = normalise(from.data[field.id], from.unit, unit);
      const after = normalise(to.data[field.id], to.unit, unit);

      if (before === null && after === null) {
        return { fieldId: field.id, label: field.label, from: null, to: null, delta: null, changed: false, note: 'missing' };
      }
      if (before === null) {
        return { fieldId: field.id, label: field.label, from: null, to: after, delta: null, changed: true, note: 'new' };
      }
      if (after === null) {
        return {
          fieldId: field.id,
          label: field.label,
          from: before,
          to: null,
          delta: null,
          changed: true,
          note: 'removed',
        };
      }

      const delta = measurementDelta(before, after);
      return {
        fieldId: field.id,
        label: field.label,
        from: before,
        to: after,
        delta,
        changed: delta.direction !== 'same',
        note: delta.direction === 'same' ? 'same' : 'changed',
      };
    });
}

export interface CompareSummary {
  total: number;
  changed: number;
  added: number;
  removed: number;
  missing: number;
}

export function compareSummary(rows: CompareRow[]): CompareSummary {
  return {
    total: rows.length,
    changed: rows.filter((row) => row.note === 'changed').length,
    added: rows.filter((row) => row.note === 'new').length,
    removed: rows.filter((row) => row.note === 'removed').length,
    missing: rows.filter((row) => row.note === 'missing').length,
  };
}

/** "3 changed · 1 new · 14 unchanged" — the readable headline at 18 fields. */
export function summaryLabel(summary: CompareSummary): string {
  const parts: string[] = [];
  if (summary.changed) parts.push(`${summary.changed} changed`);
  if (summary.added) parts.push(`${summary.added} new`);
  if (summary.removed) parts.push(`${summary.removed} cleared`);
  if (parts.length === 0) return 'No differences';
  return parts.join(' · ');
}

export function changedRows(rows: CompareRow[]): CompareRow[] {
  return rows.filter((row) => row.changed);
}
