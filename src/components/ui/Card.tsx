import { useId, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';

import { colors, radius, shadows, spacing, texture } from '@/theme';

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
  /** Fine diagonal weave — the paper feel on stat tiles and quiet cards. */
  texture?: boolean;
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
  texture: woven,
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
      {woven ? <LinenWeave /> : null}
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

/** Decorative diagonal weave clipped to the card's radius. */
function LinenWeave() {
  const uid = `weave-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <View pointerEvents="none" style={styles.weave}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id={uid}
            width={texture.spacing}
            height={texture.spacing}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <Line x1="0" y1="0" x2="0" y2={texture.spacing} stroke={texture.line} strokeWidth={1} />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${uid})`} />
      </Svg>
    </View>
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
  weave: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  pressed: { backgroundColor: colors.surfaceMuted, transform: [{ scale: 0.995 }] },
  pressedBrand: { backgroundColor: colors.primarySoft, transform: [{ scale: 0.995 }] },
});


