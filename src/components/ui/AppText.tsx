import type { TextProps } from 'react-native';
import { StyleSheet, Text } from 'react-native';

import { colors, fontFamily, typography, variantFont, type FontWeightToken, type TextVariant } from '@/theme';

type Props = TextProps & {
  variant?: TextVariant;
  weight?: FontWeightToken;
  color?: string;
  center?: boolean;
  /** Use for measurement values so digits align in columns. */
  tabular?: boolean;
};

export function AppText({
  variant = 'body',
  weight,
  color = colors.ink,
  center,
  tabular,
  style,
  ...rest
}: Props) {
  return (
    <Text
      {...rest}
      style={[
        typography[variant],
        { color, fontFamily: fontFamily[weight ?? variantFont[variant]] },
        center && styles.center,
        tabular && styles.tabular,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  tabular: { fontVariant: ['tabular-nums'] },
});
