import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Stepper } from '@/components/ui/Stepper';
import { STANDARD_TEMPLATES, type StarterTemplateKey, type Unit } from '@/data';
import { useOnboarding } from '@/features/onboarding/OnboardingProvider';
import { colors, radius, spacing } from '@/theme';

const UNITS: Array<{ key: Unit; label: string; hint: string }> = [
  { key: 'inches', label: 'Inches', hint: 'Most common in Nigeria' },
  { key: 'cm', label: 'Centimetres', hint: 'Switchable per measurement' },
];

export default function UnitAndTemplateScreen() {
  const router = useRouter();
  const { draft, update } = useOnboarding();
  const [unit, setUnit] = useState<Unit>(draft.unit);
  const [templateKey, setTemplateKey] = useState<StarterTemplateKey>(draft.templateKey);

  function next() {
    update({ unit, templateKey });
    router.push('/referral');
  }

  return (
    <Screen contentStyle={styles.content}>
      <Stepper step={3} />

      <View style={styles.headline}>
        <AppText variant="h1">How do you measure?</AppText>
        <AppText variant="body" color={colors.inkMuted}>
          Pick your default unit and the fields you use most. Everything can be renamed or removed later.
        </AppText>
      </View>

      <View style={styles.section}>
        <AppText variant="label">Default unit</AppText>
        <View style={styles.segment}>
          {UNITS.map((option) => {
            const active = unit === option.key;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                onPress={() => setUnit(option.key)}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
              >
                <AppText variant="label" color={active ? colors.primary : colors.ink}>
                  {option.label}
                </AppText>
                <AppText variant="caption" color={colors.inkMuted} center>
                  {option.hint}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="label">Starter template</AppText>
        {STANDARD_TEMPLATES.map((template) => {
          const active = templateKey === template.key;
          const preview = template.fields.slice(0, 4).map((field) => field.label);
          return (
            <Card
              key={template.key}
              onPress={() => setTemplateKey(template.key)}
              accessibilityLabel={`${template.name}, ${template.fields.length} fields`}
              style={[styles.templateCard, active && styles.templateCardActive]}
            >
              <View style={styles.templateHeader}>
                <AppText variant="label">{template.name}</AppText>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active ? <View style={styles.radioDot} /> : null}
                </View>
              </View>
              <AppText variant="caption" color={colors.inkMuted}>
                {template.description}
              </AppText>
              <AppText variant="caption" color={colors.inkSubtle}>
                {template.fields.length === 0
                  ? 'Start with no fields'
                  : `${template.fields.length} fields · ${preview.join(', ')}${template.fields.length > 4 ? '…' : ''}`}
              </AppText>
            </Card>
          );
        })}
      </View>

      <View style={styles.actions}>
        <Button label="Continue" onPress={next} />
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <AppText variant="label" color={colors.inkMuted} center>
            Back
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xl, gap: spacing.lg },
  headline: { gap: spacing.sm },
  section: { gap: spacing.sm },
  segment: { flexDirection: 'row', gap: spacing.sm },
  segmentItem: {
    flex: 1,
    gap: 2,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: 64,
    justifyContent: 'center',
  },
  segmentItemActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft, borderWidth: 1.5 },
  templateCard: { gap: spacing.xxs, marginBottom: spacing.xs },
  templateCardActive: { borderColor: colors.primary, borderWidth: 1.5, backgroundColor: colors.primarySoft },
  templateHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: radius.full, backgroundColor: colors.primary },
  actions: { gap: spacing.md, marginTop: spacing.sm },
});
