import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Wash } from '@/components/ui/Wash';
import { repositoryErrorCopy, toRepositoryError, type Measurement } from '@/data';
import { useCustomer } from '@/features/customers/queries';
import { useMeasurementVersions, useSaveMeasurementVersion } from '@/features/measurements/queries';
import { useTemplates } from '@/features/templates/queries';
import { changedRows, compareSummary, compareVersions, summaryLabel } from '@/features/measurements/compare';
import { formatLongDate, formatShortDate } from '@/lib/date';
import { formatDelta, formatMeasurement } from '@/lib/units';
import { colors, layout, radius, spacing } from '@/theme';

/**
 * Screen 24 (§5): compare two measurement versions, changed-only by default.
 * "Revert" never edits history — it saves the old values as a **new** version.
 */
export default function CompareVersionsScreen() {
  const { id, from: fromParam, to: toParam } = useLocalSearchParams<{ id: string; from?: string; to?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const customer = useCustomer(id);
  const versions = useMeasurementVersions(id);
  const templates = useTemplates();
  const saveVersion = useSaveMeasurementVersion();

  const [onlyChanged, setOnlyChanged] = useState(true);
  const [confirmRevert, setConfirmRevert] = useState(false);

  const fields = useMemo(() => templates.data?.[0]?.fields ?? [], [templates.data]);

  const { before, after } = useMemo(() => {
    const list = [...(versions.data ?? [])].sort((a, b) => b.version - a.version);
    const pick = (value: string | undefined) =>
      value ? list.find((version) => String(version.version) === value) : undefined;

    const newer = pick(toParam) ?? list.find((version) => version.isCurrent) ?? list[0];
    const older = pick(fromParam) ?? list.find((version) => version.version !== newer?.version);

    return { before: older, after: newer };
  }, [versions.data, fromParam, toParam]);

  const rows = useMemo(() => {
    if (!before || !after) return [];
    return compareVersions({
      fields,
      from: { data: before.data, unit: before.unit },
      to: { data: after.data, unit: after.unit },
    });
  }, [fields, before, after]);

  const summary = compareSummary(rows);
  const visible = onlyChanged ? changedRows(rows) : rows;

  function revert() {
    if (!before || !id) return;
    setConfirmRevert(false);

    saveVersion.mutate(
      {
        customerId: id,
        data: before.data,
        unit: before.unit,
        notes: `Reverted from v${before.version}`,
        copiedFromVersion: before.version,
        /** Carry the true measurement date through any chain of reverts. */
        sourceRecordedAt: before.sourceRecordedAt ?? before.recordedAt,
      },
      {
        onSuccess: (measurement) => {
          toast.show({
            message: `v${before.version} restored as v${measurement.version} · nothing was overwritten`,
            tone: 'success',
          });
          router.back();
        },
        onError: (error) => {
          toast.show({
            message: repositoryErrorCopy[toRepositoryError(error).code],
            tone: 'danger',
            duration: 6000,
          });
        },
      },
    );
  }

  return (
    <View style={styles.page}>
      <Stack.Screen options={{ animation: 'slide_from_right' }} />
      <Wash variant="screen" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.back}
        >
          <AppText variant="label" weight="semiBold" color={colors.primary}>
            ← {customer.data?.fullName ?? 'Measurements'}
          </AppText>
        </Pressable>

        {versions.isLoading || templates.isLoading ? (
          <View style={styles.loading}>
            <Skeleton width="60%" height={28} />
            <SkeletonText lines={2} />
            <Skeleton height={120} />
          </View>
        ) : !before || !after ? (
          <EmptyState
            title="Nothing to compare yet"
            description="A comparison needs two saved versions. Record another set of measurements and come back."
            actionLabel={id ? 'New measurement' : undefined}
            onAction={id ? () => router.push(`/customers/${id}/measurements/new` as never) : undefined}
          />
        ) : (
          <>
            <View style={styles.header}>
              <AppText variant="h1">Compare versions</AppText>
              <AppText variant="body" color={colors.inkMuted}>
                v{before.version} ({formatShortDate(before.recordedAt)}) → v{after.version} (
                {formatShortDate(after.recordedAt)})
              </AppText>
            </View>

            <View style={styles.summaryRow}>
              <AppText variant="label" weight="semiBold">
                {summaryLabel(summary)}
              </AppText>
              <Pressable
                role="switch"
                accessibilityState={{ checked: onlyChanged }}
                accessibilityLabel="Show changed fields only"
                onPress={() => setOnlyChanged((previous) => !previous)}
                style={[styles.toggle, onlyChanged && styles.toggleOn]}
              >
                <AppText variant="caption" weight="semiBold" color={onlyChanged ? colors.canvas : colors.inkMuted}>
                  Changed only
                </AppText>
              </Pressable>
            </View>

            {visible.length === 0 ? (
              <Card>
                <AppText variant="body" color={colors.inkMuted}>
                  These two versions are identical. Turn off “Changed only” to see every field.
                </AppText>
              </Card>
            ) : (
              <View style={styles.list}>
                {visible.map((row) => (
                  <Card key={row.fieldId} style={styles.row} flat>
                    <View style={styles.rowCopy}>
                      <AppText variant="label">{row.label}</AppText>
                      <AppText variant="caption" color={colors.inkMuted}>
                        {row.note === 'new'
                          ? `— → ${formatMeasurement(row.to, after.unit)}`
                          : row.note === 'removed'
                            ? `${formatMeasurement(row.from, after.unit)} → cleared`
                            : `${formatMeasurement(row.from, after.unit)} → ${formatMeasurement(row.to, after.unit)}`}
                      </AppText>
                    </View>
                    {row.note === 'new' ? (
                      <AppText variant="caption" weight="semiBold" color={colors.info}>
                        New
                      </AppText>
                    ) : row.note === 'removed' ? (
                      <AppText variant="caption" weight="semiBold" color={colors.danger}>
                        Cleared
                      </AppText>
                    ) : row.delta ? (
                      <AppText
                        variant="caption"
                        weight="semiBold"
                        color={row.delta.direction === 'same' ? colors.inkSubtle : colors.primary}
                      >
                        {row.delta.direction === 'up' ? '↑ ' : row.delta.direction === 'down' ? '↓ ' : ''}
                        {formatDelta(row.delta.diff, after.unit)}
                      </AppText>
                    ) : null}
                  </Card>
                ))}
              </View>
            )}

            <View style={styles.actions}>
              <Button
                label={`Revert to v${before.version}`}
                variant="secondary"
                disabled={saveVersion.isPending}
                onPress={() => setConfirmRevert(true)}
              />
              <AppText variant="caption" color={colors.inkSubtle} center>
                Reverting saves v{before.version}’s values as a new version — the current one stays in history.
              </AppText>
            </View>
          </>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={confirmRevert}
        title={`Restore v${before?.version ?? ''}?`}
        message={`Its ${Object.values(before?.data ?? {}).filter((value) => typeof value === 'number').length} values are saved as a new version, dated ${formatShortDate(before?.sourceRecordedAt ?? before?.recordedAt ?? '')} — the real measurement date. Nothing is overwritten and v${after?.version ?? ''} stays in history.`}
        confirmLabel="Save as new version"
        loading={saveVersion.isPending}
        onCancel={() => setConfirmRevert(false)}
        onConfirm={revert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: layout.gutter, gap: spacing.lg },
  back: { minHeight: layout.touchTarget, justifyContent: 'center', alignSelf: 'flex-start' },
  loading: { gap: spacing.lg },
  header: { gap: spacing.xxs },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  toggle: {
    minHeight: layout.touchTarget - 8,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  list: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  rowCopy: { flex: 1, gap: spacing.xxs },
  actions: { gap: spacing.sm, paddingTop: spacing.sm },
});
