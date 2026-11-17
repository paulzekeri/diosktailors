import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { Wash } from '@/components/ui/Wash';
import { repositoryErrorCopy, toRepositoryError } from '@/data';
import { useCustomer } from '@/features/customers/queries';
import { useCurrentMeasurement } from '@/features/measurements/queries';
import { useCreateProject } from '@/features/projects/queries';
import {
  EMPTY_PROJECT_FORM,
  toNewProject,
  validateProjectForm,
  type ProjectFormValues,
} from '@/features/projects/validation';
import { addDaysISO, formatLongDate } from '@/lib/date';
import type { FieldErrors } from '@/lib/forms';
import { colors, layout, radius, spacing } from '@/theme';

/**
 * Screen 25 (§5): new job for a customer. Defaults to `pending`, links the
 * current measurement version, and lands on the detail so the status flow can
 * start immediately.
 */
export default function NewProjectScreen() {
  const { id: customerId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const customer = useCustomer(customerId);
  const measurement = useCurrentMeasurement(customerId);
  const create = useCreateProject();

  const [values, setValues] = useState<ProjectFormValues>({
    ...EMPTY_PROJECT_FORM,
    expectedDeliveryAt: addDaysISO(14),
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [linkMeasurement, setLinkMeasurement] = useState(true);

  function setField<K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) {
    setValues((previous) => ({ ...previous, [key]: value }));
    if (errors[key]) setErrors((previous) => ({ ...previous, [key]: undefined }));
  }

  function validateField(key: keyof ProjectFormValues) {
    const result = validateProjectForm(values);
    setErrors((previous) => ({ ...previous, [key]: result.success ? undefined : result.errors[key] }));
  }

  function submit() {
    const result = validateProjectForm(values);
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    if (!customerId) return;

    const linked = linkMeasurement ? measurement.data?.id : undefined;

    create.mutate(toNewProject(customerId, result.data, linked) as never, {
      onSuccess: (project) => {
        toast.show({
          message: `${project.name} created · due ${formatLongDate(project.expectedDeliveryAt)}`,
          tone: 'success',
        });
        router.replace(`/projects/${project.id}` as never);
      },
      onError: (error) => {
        toast.show({ message: repositoryErrorCopy[toRepositoryError(error).code], tone: 'danger', duration: 6000 });
      },
    });
  }

  return (
    <View style={styles.page}>
      <Stack.Screen options={{ presentation: 'modal' }} />
      <Wash variant="screen" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <AppText variant="h1">New job</AppText>
              <AppText variant="body" color={colors.inkMuted}>
                {customer.data ? `For ${customer.data.fullName}` : 'For this customer'} · starts as pending
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={() => router.back()}
              hitSlop={10}
              style={styles.close}
            >
              <AppText variant="label" weight="semiBold" color={colors.inkMuted}>
                Close
              </AppText>
            </Pressable>
          </View>

          <Card style={styles.measureCard} tone={linkMeasurement && measurement.data ? 'brand' : 'default'}>
            <View style={styles.measureCopy}>
              <AppText variant="caption" color={colors.inkMuted}>
                Measurements
              </AppText>
              <AppText variant="label" weight="semiBold">
                {measurement.data
                  ? `Version ${measurement.data.version} · ${measurement.data.unit === 'inches' ? 'inches' : 'cm'}`
                  : 'None recorded yet'}
              </AppText>
            </View>
            {measurement.data ? (
              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: linkMeasurement }}
                accessibilityLabel="Link this measurement to the job"
                onPress={() => setLinkMeasurement((previous) => !previous)}
                style={[styles.linkToggle, linkMeasurement && styles.linkToggleOn]}
              >
                <AppText variant="caption" weight="semiBold" color={linkMeasurement ? colors.canvas : colors.inkMuted}>
                  {linkMeasurement ? 'Linked' : 'Link'}
                </AppText>
              </Pressable>
            ) : (
              <AppText variant="caption" color={colors.inkSubtle}>
                Measure first
              </AppText>
            )}
          </Card>

          <TextField
            label="Job name"
            value={values.name}
            onChangeText={(text) => setField('name', text)}
            onBlur={() => validateField('name')}
            error={errors.name}
            placeholder="Wedding gown"
            autoCapitalize="sentences"
            returnKeyType="next"
          />

          <TextField
            label="Expected delivery"
            value={values.expectedDeliveryAt}
            onChangeText={(text) => setField('expectedDeliveryAt', text)}
            onBlur={() => validateField('expectedDeliveryAt')}
            error={errors.expectedDeliveryAt}
            helper="YYYY-MM-DD · defaults to two weeks from today"
            placeholder="2026-12-01"
            maxLength={10}
          />

          <TextField
            label="Description"
            value={values.description}
            onChangeText={(text) => setField('description', text)}
            onBlur={() => validateField('description')}
            error={errors.description}
            placeholder="Fabric, style, details"
            multiline
            numberOfLines={3}
          />

          <TextField
            label="Instructions"
            value={values.instructions}
            onChangeText={(text) => setField('instructions', text)}
            onBlur={() => validateField('instructions')}
            error={errors.instructions}
            placeholder="Beading on the bodice only, pick-up Saturday"
            multiline
            numberOfLines={3}
          />

          <TextField
            label="Notes"
            value={values.notes}
            onChangeText={(text) => setField('notes', text)}
            onBlur={() => validateField('notes')}
            error={errors.notes}
            placeholder="Anything worth remembering"
            multiline
            numberOfLines={3}
          />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Button label="Save job" loading={create.isPending} onPress={submit} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  flex: { flex: 1 },
  content: { paddingHorizontal: layout.gutter, paddingBottom: spacing.xxl, gap: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  headerCopy: { flex: 1, gap: spacing.xxs },
  close: { minHeight: layout.touchTarget, justifyContent: 'center', paddingHorizontal: spacing.sm },
  measureCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  measureCopy: { flex: 1, gap: spacing.xxs },
  linkToggle: {
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  linkToggleOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  footer: {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.md,
    backgroundColor: colors.canvasDeep,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
});
