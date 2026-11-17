/**
 * Measurement data hooks. Versioning is append-only: saving always creates a
 * new version, so screens never patch a measurement in place.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { repo, RepositoryError, type NewMeasurement } from '@/data';
import { customerKeys, templateKeys } from '@/data/queryKeys';

export function useMeasurementVersions(customerId: string | undefined) {
  return useQuery({
    queryKey: customerKeys.measurements(customerId ?? ''),
    enabled: Boolean(customerId),
    queryFn: () => {
      if (!customerId) throw new RepositoryError('not_found');
      return repo.measurements.listVersions(customerId);
    },
  });
}

export function useCurrentMeasurement(customerId: string | undefined) {
  return useQuery({
    queryKey: customerKeys.currentMeasurement(customerId ?? ''),
    enabled: Boolean(customerId),
    queryFn: () => {
      if (!customerId) throw new RepositoryError('not_found');
      return repo.measurements.current(customerId);
    },
  });
}

/** "Save new version" — invalidates the whole version list for that customer. */
export function useSaveMeasurementVersion() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: NewMeasurement) => repo.measurements.saveVersion(input),
    onSuccess: (measurement) => {
      void client.invalidateQueries({ queryKey: customerKeys.measurements(measurement.customerId) });
    },
  });
}

/** "Revert to v2" marks the old version current — it does not delete anything. */
export function useSetCurrentMeasurement(customerId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (measurementId: string) => repo.measurements.setCurrent(customerId, measurementId),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: customerKeys.measurements(customerId) });
    },
  });
}

/** Field definitions for the entry form (18 fields for the standard templates). */
export function useTemplates() {
  return useQuery({ queryKey: templateKeys.list(), queryFn: () => repo.templates.list() });
}
