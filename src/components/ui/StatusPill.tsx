import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { alpha, radius, spacing, statusTheme, type ProjectStatus } from '@/theme';

/** Status is never colour-only: the label is always present (a11y rule §4.7). */
export function StatusPill({ status }: { status: ProjectStatus }) {
  const theme = statusTheme[status];
  return (
    <View style={[styles.pill, { backgroundColor: theme.bg, borderColor: alpha(theme.fg, 0.18) }]}>
      <View pointerEvents="none" style={styles.sheen} />
      <AppText variant="micro" weight="semiBold" color={theme.fg}>
        {theme.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: spacing.md,
    right: spacing.md,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});
