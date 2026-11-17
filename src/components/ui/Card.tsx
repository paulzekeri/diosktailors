import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '@/theme';

type Tone = 'default' | 'muted' | 'brand';

type Props = {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Deeper lift for hero cards. */
  elevated?: boolean;
  padded?: boolean;
  /** Drop the resting shadow for dense or nested surfaces. */
  flat?: boolean;
  /** Tinted fill: quiet section (`muted`) or wine-washed highlight (`brand`). */
  tone?: Tone;
  /** 3px rule on the leading edge — marks the row that needs attention. */
  accent?: 'primary' | 'gold' | 'danger';
  accessibilityLabel?: string;
};

const TONES: Record<Tone, ViewStyle> = {
  default: { backgroundColor: colors.surface, borderColor: colors.border },
  muted: { backgroundColor: colors.surfaceMuted, borderColor: colors.hairline },
  brand: { backgroundColor: colors.primaryTint, borderColor: colors.primarySoft },
};

const ACCENTS = { primary: colors.primary, gold: colors.gold, danger: colors.danger } as const;

export function Card({
  children,
  onPress,
  style,
  elevated,
  padded = true,
  flat,
  tone = 'default',
  accent,
  accessibilityLabel,
}: Props) {
  const base = [
    styles.card,
    TONES[tone],
    !flat && (elevated ? shadows.e2 : shadows.ambient),
    padded && styles.padded,
    accent && { borderLeftWidth: 3, borderLeftColor: ACCENTS[accent] },
    style,
  ];

  const content = (
    <>
      <View pointerEvents="none" style={styles.sheen} />
      {children}
    </>
  );

  if (!onPress) {
    return <View style={base}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        ...base,
        pressed && (tone === 'brand' ? styles.pressedBrand : styles.pressed),
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  padded: { padding: spacing.lg },
  /** 1px inner highlight — the "lit edge" that stops surfaces reading flat. */
  sheen: {
    position: 'absolute',
    top: 1,
    left: spacing.lg,
    right: spacing.lg,
    height: 1,
    backgroundColor: colors.highlight,
    opacity: 0.9,
  },
  pressed: { backgroundColor: colors.surfaceMuted, transform: [{ scale: 0.995 }] },
  pressedBrand: { backgroundColor: colors.primarySoft, transform: [{ scale: 0.995 }] },
});

