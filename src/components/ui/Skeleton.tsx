import { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing } from '@/theme';

/**
 * Loading placeholders (design contract: never spin for >400 ms without a
 * skeleton). Decorative only — hidden from screen readers, the screen announces
 * "Loading" in text instead.
 */

type Props = {
  width?: DimensionValue;
  height?: number;
  /** Corner radius. Defaults to half the height, so lines read as pills. */
  round?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({ width = '100%', height = 14, round, style }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.block,
        {
          width,
          height,
          borderRadius: round ?? height / 2,
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
        },
        style,
      ]}
    />
  );
}

/** Paragraph placeholder; the last line is short so it reads as text. */
export function SkeletonText({ lines = 2 }: { lines?: number }) {
  return (
    <View style={styles.text}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={12}
          width={index === lines - 1 ? '60%' : '100%'}
          round={radius.xs / 2}
        />
      ))}
    </View>
  );
}

/** A list row: avatar disc plus two lines — customers, projects, reminders. */
export function SkeletonRow() {
  return (
    <View style={styles.row}>
      <Skeleton width={44} height={44} round={radius.full} />
      <View style={styles.rowCopy}>
        <Skeleton width="55%" height={12} />
        <Skeleton width="35%" height={10} />
      </View>
    </View>
  );
}

/** Repeated rows for a list screen's loading state. */
export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonRow key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { backgroundColor: colors.skeleton },
  text: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.sm,
  },
  rowCopy: { flex: 1, gap: spacing.sm },
  list: { gap: spacing.xs },
});
