import { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

import { wash } from '@/theme';

type Variant = 'screen' | 'hero' | 'backdrop';

type Props = {
  /** `screen` whisper, `hero` blush for landing/auth, `backdrop` glow behind the desktop frame. */
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
};

/**
 * Decorative ambience that sits behind content (design contract §4.1 — the
 * atelier layer). Purely visual: no accessible nodes, no meaning, no events.
 * Uses react-native-svg so the fade stays smooth on native and web.
 */
export function Wash({ variant = 'screen', style }: Props) {
  const uid = `wash-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, style]}
    >
      {variant === 'backdrop' ? <BackdropGlow id={uid} /> : <ScreenWash id={uid} hero={variant === 'hero'} />}
    </View>
  );
}

function ScreenWash({ id, hero }: { id: string; hero: boolean }) {
  const tones = hero ? wash.hero : wash.screen;

  return (
    <Svg width="100%" height="100%">
      <Defs>
        <LinearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={tones.top} />
          <Stop offset="0.5" stopColor={tones.mid} />
          <Stop offset="1" stopColor={tones.edge} />
        </LinearGradient>
        <RadialGradient id={`${id}-glow`} cx="0.84" cy="0.02" r="0.72">
          <Stop offset="0" stopColor={wash.heroGlow.center} />
          <Stop offset="1" stopColor={wash.heroGlow.edge} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id}-fade)`} />
      {hero ? <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id}-glow)`} /> : null}
    </Svg>
  );
}

function BackdropGlow({ id }: { id: string }) {
  return (
    <Svg width="100%" height="100%">
      <Defs>
        <RadialGradient id={`${id}-halo`} cx="0.5" cy="0.46" r="0.62">
          <Stop offset="0" stopColor={wash.glow.center} />
          <Stop offset="0.62" stopColor={wash.glow.mid} />
          <Stop offset="1" stopColor={wash.glow.edge} />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id}-halo)`} />
    </Svg>
  );
}
