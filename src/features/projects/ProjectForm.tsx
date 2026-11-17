import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Wash } from '@/components/ui/Wash';
import {
  EMPTY_PROJECT_FORM,
  validateProjectForm,
  type ProjectFormValues,
  type ValidProjectForm,
} from '@/features/projects/validation';
import type { FieldErrors } from '@/lib/forms';
import { colors, layout, radius, spacing } from '@/theme';

type Props = {
  title: string;
  subtitle: string;
  submitLabel: string;
  initialValues?: ProjectFormValues;
  busy?: boolean;
  /** Measurement link card on create, version summary on edit. */
  aboveFields?: ReactNode;
  onSubmit: (values: ValidProjectForm) => void;
  onClose: () => void;
  /** Rendered after the fields (retire note, links). */
  children?: ReactNode;
};

/**
 * The job form shared by "new job" (screen 25) and "edit job" (screen 27).
 * Dates are typed `YYYY-MM-DD`; validating on blur keeps the 430px column calm.
 */
export function ProjectForm({
  title,
  subtitle,
  submitLabel,
  initialValues = EMPTY_PROJECT_FORM,
  busy = false,
  aboveFields,
  onSubmit,
  onClose,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<ProjectFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});

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
    onSubmit(result.data);
  }

  return (
    <View style={styles.page}>
      <Wash variant="screen" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <AppText variant="h1">{title}</AppText>
              <AppText variant="body" color={colors.inkMuted}>
                {subtitle}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              hitSlop={10}
              style={styles.close}
            >
              <AppText variant="label" weight="semiBold" color={colors.inkMuted}>
                Close
              </AppText>
            </Pressable>
          </View>

          {aboveFields}

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
            helper="YYYY-MM-DD"
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

          {children}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Button label={submitLabel} loading={busy} onPress={submit} />
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
  footer: {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.md,
    backgroundColor: colors.canvasDeep,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  note: { gap: spacing.xxs, borderRadius: radius.md, padding: spacing.md, backgroundColor: colors.surfaceMuted },
});
