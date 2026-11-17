import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Wash } from '@/components/ui/Wash';
import { layout, spacing } from '@/theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  /** Extra space below the content (e.g. tab bar height on tab screens). */
  bottomPadding?: number;
  contentStyle?: ViewStyle;
  /** Decorative top wash: `soft` everywhere, `hero` on landing/auth, `none` for dense screens. */
  ambience?: 'soft' | 'hero' | 'none';
};

export function Screen({
  children,
  scroll = true,
  padded = true,
  bottomPadding,
  contentStyle,
  ambience = 'soft',
}: Props) {
  const insets = useSafeAreaInsets();
  const pad = bottomPadding ?? spacing.xxl;

  const content = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        { paddingTop: insets.top, paddingBottom: pad + insets.bottom },
        padded && styles.padded,
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.padded, { paddingTop: insets.top, paddingBottom: pad + insets.bottom }]}>
      {children}
    </View>
  );

  if (ambience === 'none') return content;

  return (
    <View style={styles.flex}>
      <Wash variant={ambience === 'hero' ? 'hero' : 'screen'} />
      {content}
    </View>
  );
}

export const screenGutter = (width: number) => (width <= layout.smallPhoneWidth ? layout.gutterSmall : layout.gutter);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  padded: { paddingHorizontal: layout.gutter },
});
