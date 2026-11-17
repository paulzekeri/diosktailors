import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';
import { colors, radius, spacing } from '@/theme';

type Props = {
  title: string;
  description?: string;
  /** Usually an icon; a soft disc keeps the copy centred. */
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  /** `error` tints the disc for failed loads; default is the quiet empty state. */
  tone?: 'default' | 'error';
};

/** Empty, no-results and error states share this shape (design contract §4.6). */
export function EmptyState({ title, description, icon, actionLabel, onAction, tone = 'default' }: Props) {
  return (
    <View style={styles.wrap}>
      {icon ? <View style={[styles.badge, tone === 'error' && styles.badgeError]}>{icon}</View> : null}
      <AppText variant="h3" center>
        {title}
      </AppText>
      {description ? (
        <AppText variant="body" color={colors.inkMuted} center>
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" fullWidth={false} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  badgeError: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft },
});
