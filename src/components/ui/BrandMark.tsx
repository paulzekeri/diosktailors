import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { AppText } from './AppText';
import { colors, fontFamily, shadows } from '@/theme';

type Props = {
  size?: number;
  /** Monogram letter(s) shown in the disc. */
  initial?: string;
  /** Announced by screen readers; the disc itself is decorative. */
  label?: string;
  /** Soft wine lift behind the disc. */
  elevated?: boolean;
};

/**
 * The atelier mark: a deep-wine disc with a gold hairline ring and a
 * single monogram letter. Echoes the reference's logo disc without
 * introducing photography or a second brand colour.
 */
export function BrandMark({ size = 44, initial = 'D', label = 'DIOKS', elevated = true }: Props) {
  const id = `mark-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const inset = size <= 40 ? 1 : 1.5;

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="image"
      style={[
        styles.shell,
        { width: size, height: size, borderRadius: size / 2 },
        elevated && shadows.brandSoft,
      ]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id={`${id}-fill`} x1="0.1" y1="0" x2="0.9" y2="1">
            <Stop offset="0" stopColor={colors.primary} />
            <Stop offset="1" stopColor={colors.primaryDeep} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id}-fill)`} />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - inset}
          fill="none"
          stroke={colors.gold}
          strokeWidth={1}
          strokeOpacity={0.6}
        />
      </Svg>
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[StyleSheet.absoluteFill, styles.center]}
      >
        <AppText
          weight="bold"
          color={colors.white}
          style={{ fontFamily: fontFamily.bold, fontSize: Math.round(size * 0.4), lineHeight: Math.round(size * 0.5) }}
        >
          {initial}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
