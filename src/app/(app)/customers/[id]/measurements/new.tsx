import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { goBack } from '@/lib/navigation';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { MeasurementInput } from '@/components/ui/MeasurementInput';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Wash } from '@/components/ui/Wash';
import { repositoryErrorCopy, toRepositoryError, type TemplateField, type Unit } from '@/data';
import { useCustomer } from '@/features/customers/queries';
import { clearDraft, loadDraft, saveDraft } from '@/features/measurements/draftStore';
import { useCurrentMeasurement, useSaveMeasurementVersion } from '@/features/measurements/queries';
import { useTemplates } from '@/features/templates/queries';
import {
  convertDraft,
  draftFromValues,
  groupFields,
  measurementProgress,
  validateMeasurement,
  type MeasurementDraft,
  type MeasurementErrors,
  type MeasurementValues,
} from '@/features/measurements/validation';
import { formatMeasurementValue } from '@/lib/units';
import { colors, layout, radius, spacing } from '@/theme';

/**
 * Screen 23 — the hero screen (§4.6). Grouped fields with fraction chips and
 * last-value ghosts, a live "12 of 18 filled" counter, an in|cm toggle, a local
 * draft, and a sticky save that always creates a new version.
 */
export default function NewMeasurementScreen() {
  const { id: customerId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const customer = useCustomer(customerId);
  const current = useCurrentMeasurement(customerId);
  const templates = useTemplates();
  const saveVersion = useSaveMeasurementVersion();

  const fields = useMemo<TemplateField[]>(() => templates.data?.[0]?.fields ?? [], [templates.data]);
  const sections = useMemo(() => groupFields(fields), [fields]);
  const ghostValues = useMemo<MeasurementValues>(
    () => (current.data?.data as MeasurementValues | undefined) ?? {},
    [current.data],
  );

  const [unit, setUnit] = useState<Unit>('inches');
  const [draft, setDraft] = useState<MeasurementDraft>({});
  const [errors, setErrors] = useState<MeasurementErrors>({});
  const [restored, setRestored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const scrollRef = useRef<ScrollViewInstance>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const initialised = useRef(false);

  // Restore the local draft once, as soon as the template and current version are known.
  useEffect(() => {
    if (initialised.current || !customerId || templates.isLoading || current.isLoading) return;
    initialised.current = true;

    void (async () => {
      const stored = await loadDraft(customerId);
      if (stored) {
        setDraft(stored.values);
        setUnit(stored.unit);
        setRestored(true);
      } else if (current.data) {
        setUnit(current.data.unit);
      }
      setLoaded(true);
    })();
  }, [customerId, templates.isLoading, current.isLoading, current.data]);

  // Autosave the draft 600 ms after the last keystroke (§4.6: auto-save drafts).
  useEffect(() => {
    if (!loaded || !customerId) return;
    const timer = setTimeout(() => void saveDraft(customerId, draft, unit), 600);
    return () => clearTimeout(timer);
  }, [draft, unit, customerId, loaded]);

  const validation = useMemo(() => validateMeasurement(fields, draft, unit), [fields, draft, unit]);
  const progress = useMemo(() => measurementProgress(fields, validation.values), [fields, validation.values]);
  const nextVersion = (current.data?.version ?? 0) + 1;

  function setField(fieldId: string, text: string) {
    setDraft((previous) => ({ ...previous, [fieldId]: text }));
    setErrors((previous) => ({ ...previous, [fieldId]: undefined }));
  }

  function useGhost(fieldId: string, value: number) {
    setField(fieldId, formatMeasurementValue(value, unit));
  }

  function copyLastVersion() {
    setDraft(draftFromValues(fields, ghostValues, unit));
    setErrors({});
  }

  /** The toggle re-expresses what is already typed instead of discarding it. */
  function changeUnit(next: Unit) {
    if (next === unit) return;
    setDraft((previous) => convertDraft(previous, unit, next));
    setUnit(next);
    setErrors({});
  }

  function scrollToFirstInvalid() {
    const first = fields.find(
      (field) => Boolean(validation.errors[field.id]) || (field.required && validation.values[field.id] === null),
    );
    const y = first ? sectionOffsets.current[first.group] : undefined;
    if (typeof y === 'number') scrollRef.current?.scrollTo({ y: Math.max(0, y - spacing.lg), animated: true });
  }

  function save() {
    if (!customerId) return;

    if (!validation.valid) {
      setErrors(validation.errors);
      toast.show({
        message:
          validation.requiredMissing > 0
            ? `Fill ${validation.requiredMissing} required ${validation.requiredMissing === 1 ? 'field' : 'fields'}`
            : 'Check the highlighted fields',
        tone: 'danger',
      });
      scrollToFirstInvalid();
      return;
    }

    saveVersion.mutate(
      { customerId, data: validation.values, unit },
      {
        onSuccess: (measurement) => {
          void clearDraft(customerId);
          toast.show({
            message:
              measurement.version > 1
                ? `Saved as v${measurement.version} · v${measurement.version - 1} kept in history`
                : 'Saved as v1 · first version',
            tone: 'success',
          });
          goBack(router, `/customers/${customerId}`);
        },
        onError: (error) => {
          toast.show({ message: repositoryErrorCopy[toRepositoryError(error).code], tone: 'danger', duration: 6000 });
        },
      },
    );
  }

  function saveAsDraft() {
    if (!customerId) return;
    void saveDraft(customerId, draft, unit);
    toast.show({ message: 'Draft saved on this device' });
  }

  return (
    <View style={styles.page}>
      <Stack.Screen options={{ animation: 'slide_from_right' }} />
      <Wash variant="screen" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => goBack(router, `/customers/${customerId}`)}
            hitSlop={10}
            style={styles.back}
          >
            <AppText variant="label" weight="semiBold" color={colors.primary}>
              ← Back
            </AppText>
          </Pressable>

          <View style={styles.identity}>
            <Avatar name={customer.data?.fullName ?? 'Customer'} uri={customer.data?.photoUrl} size="md" />
            <View style={styles.identityCopy}>
              <AppText variant="h2" numberOfLines={1}>
                {customer.data?.fullName ?? 'Customer'}
              </AppText>
              <AppText variant="caption" color={colors.inkMuted}>
                Measurement v{nextVersion}
                {current.data ? ` · v${current.data.version} is current` : ''}
              </AppText>
            </View>
          </View>

          {templates.isLoading ? (
            <View style={styles.loading}>
              <Skeleton height={44} />
              <Skeleton height={44} />
              <Skeleton height={44} />
            </View>
          ) : fields.length === 0 ? (
            <EmptyState
              title="No measurement fields"
              description="Finish onboarding or pick a template first — then measurements can be recorded here."
              actionLabel="Go back"
              onAction={() => goBack(router, `/customers/${customerId}`)}
            />
          ) : (
            <>
              <SegmentedTabs
                accessibilityLabel="Measurement unit"
                value={unit}
                onChange={changeUnit}
                options={[
                  { value: 'inches', label: 'in' },
                  { value: 'cm', label: 'cm' },
                ]}
              />

              <View style={styles.progress}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.round(progress.ratio * 100)}%` }]} />
                </View>
                <AppText variant="caption" color={colors.inkMuted}>
                  {progress.filled} of {progress.total} filled
                </AppText>
              </View>

              {restored ? (
                <AppText variant="caption" color={colors.info} accessibilityLiveRegion="polite">
                  Draft restored from this device · saving a version clears it
                </AppText>
              ) : null}

              {current.data && progress.filled === 0 ? (
                <Button label="Use last version's values" variant="secondary" onPress={copyLastVersion} />
              ) : null}

              {sections.map((section) => (
                <View
                  key={section.group}
                  style={styles.section}
                  onLayout={(event) => {
                    sectionOffsets.current[section.group] = event.nativeEvent.layout.y;
                  }}
                >
                  <AppText variant="h3">{section.label}</AppText>
                  {section.fields.map((field) => {
                    const ghost = ghostValues[field.id];
                    return (
                      <MeasurementInput
                        key={field.id}
                        label={field.label}
                        value={draft[field.id] ?? ''}
                        onChangeText={(text) => setField(field.id, text)}
                        unit={unit}
                        ghost={typeof ghost === 'number' ? ghost : undefined}
                        onUseGhost={() => useGhost(field.id, ghost as number)}
                        error={errors[field.id]}
                      />
                    );
                  })}
                </View>
              ))}
            </>
          )}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Button label={`Save version ${nextVersion}`} loading={saveVersion.isPending} onPress={save} />
          <Button label="Save draft" variant="ghost" onPress={saveAsDraft} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },
  content: { paddingHorizontal: layout.gutter, paddingBottom: spacing.xxl, gap: spacing.lg },
  back: { minHeight: layout.touchTarget, justifyContent: 'center', alignSelf: 'flex-start' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  identityCopy: { flex: 1, gap: spacing.xxs },
  loading: { gap: spacing.md },
  progress: { gap: spacing.xs },
  progressTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: radius.full, backgroundColor: colors.primary },
  section: { gap: spacing.md },
  footer: {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.md,
    gap: spacing.xs,
    backgroundColor: colors.canvasDeep,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
});

