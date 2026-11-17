import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Unit } from '@/data/types';
import type { MeasurementDraft } from './validation';

/**
 * Local draft persistence for the measurement form (§4.6.4: "Drafts persist
 * locally"). One draft per customer; saving a version clears it. Never throws —
 * a corrupt or missing draft just means the form starts empty.
 */
const PREFIX = 'dioks.measurement.draft.v1.';

export interface StoredDraft {
  values: MeasurementDraft;
  unit: Unit;
  updatedAt: string;
}

export function draftKey(customerId: string): string {
  return `${PREFIX}${customerId}`;
}

export async function loadDraft(customerId: string): Promise<StoredDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(draftKey(customerId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    if (!parsed || typeof parsed !== 'object' || !parsed.values) return null;
    return {
      values: parsed.values,
      unit: parsed.unit === 'cm' ? 'cm' : 'inches',
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function saveDraft(customerId: string, values: MeasurementDraft, unit: Unit): Promise<void> {
  try {
    const draft: StoredDraft = { values, unit, updatedAt: new Date().toISOString() };
    await AsyncStorage.setItem(draftKey(customerId), JSON.stringify(draft));
  } catch {
    /* a full device or private mode must never block measuring */
  }
}

export async function clearDraft(customerId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(draftKey(customerId));
  } catch {
    /* ignore */
  }
}
