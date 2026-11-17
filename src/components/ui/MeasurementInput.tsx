import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from './AppText';
import type { Unit } from '@/data/types';
import { FRACTION_CHIPS, addFraction, formatMeasurement } from '@/lib/units';
import { colors, fontFamily, layout, radius, spacing } from '@/theme';

type Props = {
  label: string;
  /** Raw text, not a number: fractions are legal input. */
  value: string;
  onChangeText: (value: string) => void;
  unit: Unit;
  /** Last recorded value for this field — tap to reuse "same as last time". */
  ghost?: number | null;
  onUseGhost?: () => void;
  error?: string;
  onFocusChange?: (focused: boolean) => void;
};

/**
 * One measurement row (§4.6.3): label, decimal input with the unit suffix, a
 * grey ghost of the previous value, and fraction chips for the focused field.
 * Chips only appear while the field is focused so 18 rows stay compact.
 */
export function MeasurementInput({
  label,
  value,
  onChangeText,
  unit,
  ghost,
  onUseGhost,
  error,
  onFocusChange,
}: Props) {
  const [focused, setFocused] = useState(false);
  const showGhost = typeof ghost === 'number' && onUseGhost !== undefined;

  return (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        <AppText variant="label" color={colors.inkMuted}>
          {label}
        </AppText>
        {showGhost ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Use last ${label}, ${formatMeasurement(ghost, unit)}`}
            onPress={onUseGhost}
            hitSlop={8}
            style={styles.ghost}
          >
            <AppText variant="caption" color={colors.inkSubtle}>
              last {formatMeasurement(ghost, unit)}
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <View style={[styles.shell, focused && styles.focused, Boolean(error) && styles.invalid]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => {
            setFocused(true);
            onFocusChange?.(true);
          }}
          onBlur={() => {
            setFocused(false);
            onFocusChange?.(false);
          }}
          placeholder="—"
          placeholderTextColor={colors.inkSubtle}
          keyboardType="decimal-pad"
          inputMode="decimal"
          accessibilityLabel={label}
          style={styles.input}
        />
        <AppText variant="label" color={colors.inkSubtle}>
          {unit === 'inches' ? 'in' : 'cm'}
        </AppText>
      </View>

      {focused && unit === 'inches' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.chips}
        >
          {FRACTION_CHIPS.map((chip) => (
            <Pressable
              key={chip.label}
              accessibilityRole="button"
              accessibilityLabel={`${chip.numerator} over ${chip.denominator}`}
              onPress={() => onChangeText(addFraction(value, chip.numerator, chip.denominator))}
              hitSlop={4}
              style={styles.chip}
            >
              <AppText variant="label" weight="semiBold" color={colors.primary}>
                {chip.label}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {error ? (
        <AppText variant="caption" color={colors.danger} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.xs },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  ghost: { paddingVertical: 2 },
  shell: {
    minHeight: layout.touchTarget + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceWell,
  },
  focused: { borderColor: colors.primary, backgroundColor: colors.surface },
  invalid: { borderColor: colors.danger, backgroundColor: colors.surface },
  input: {
    flex: 1,
    minHeight: layout.touchTarget,
    color: colors.ink,
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
    paddingVertical: spacing.sm,
  },
  chips: { gap: spacing.xs, paddingVertical: 2 },
  chip: {
    minWidth: layout.touchTarget,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.primaryTint,
  },
});
