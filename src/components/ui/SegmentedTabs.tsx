import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors, layout, radius, spacing } from '@/theme';

type Option<T extends string> = {
  value: T;
  label: string;
  /** Optional count, rendered after the label (`Measurements · 6`). */
  count?: number;
};

type Props<T extends string> = {
  options: ReadonlyArray<Option<T>>;
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
};

/**
 * Segmented control used by the customer profile (Measurements / Projects /
 * Details). 44px targets, label always visible, active segment gets the wine
 * wash rather than a colour-only cue.
 */
export function SegmentedTabs<T extends string>({ options, value, onChange, accessibilityLabel }: Props<T>) {
  return (
    <View role="tablist" accessibilityLabel={accessibilityLabel} style={styles.track}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            role="tab"
            aria-selected={active}
            accessibilityLabel={option.count === undefined ? option.label : `${option.label}, ${option.count}`}
            onPress={() => onChange(option.value)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <AppText
              variant="label"
              weight={active ? 'semiBold' : 'medium'}
              color={active ? colors.primary : colors.inkMuted}
              numberOfLines={1}
            >
              {option.label}
            </AppText>
            {option.count === undefined ? null : (
              <AppText variant="caption" color={active ? colors.primary : colors.inkSubtle}>
                {option.count}
              </AppText>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  segment: {
    flex: 1,
    minHeight: layout.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
  },
  segmentActive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
