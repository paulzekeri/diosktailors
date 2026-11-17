import type { ReactNode } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Wash } from '@/components/ui/Wash';
import { colors, layout, radius, shadows, spacing } from '@/theme';

/**
 * The phone-only shell (design contract §4.4).
 * - phones: full-bleed, 100% width, max 430px
 * - desktop/tablet web: centred device frame on a warm backdrop
 * No screen may exceed `layout.maxWidth`.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const framed = Platform.OS === 'web' && width >= layout.desktopBreakpoint;
  const frameHeight = Math.min(height - spacing.massive, layout.frameMaxHeight);

  return (
    <View style={[styles.page, framed && styles.pageDesktop]}>
      {framed ? <Wash variant="backdrop" /> : null}
      <View style={[styles.app, framed ? { height: frameHeight } : styles.fill, framed && styles.frame]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  pageDesktop: {
    backgroundColor: colors.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
  },
  app: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    backgroundColor: colors.canvas,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
  },
  frame: {
    borderRadius: radius.frame,
    borderWidth: 1,
    borderColor: colors.frameBorder,
    borderTopColor: colors.highlight,
    ...shadows.e2,
  },
});
