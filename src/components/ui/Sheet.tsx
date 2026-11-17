import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { CloseIcon } from './icons';
import { alpha, colors, radius, shadows, spacing } from '@/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  /** Unsaved-changes guard: pass `false` while a save is in flight. */
  dismissable?: boolean;
};

/**
 * Bottom sheet for create flows and confirmations (design contract §4.6:
 * create flows are modals, never tabs, and always have a close affordance).
 */
export function Sheet({ visible, onClose, title, subtitle, children, footer, dismissable = true }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.page}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          disabled={!dismissable}
          onPress={onClose}
          style={styles.backdrop}
        />
        <View
          accessibilityViewIsModal
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          <View pointerEvents="none" style={styles.handle} />
          {title ? (
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <AppText variant="h3">{title}</AppText>
                {subtitle ? (
                  <AppText variant="body" color={colors.inkMuted}>
                    {subtitle}
                  </AppText>
                ) : null}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={10}
                disabled={!dismissable}
                onPress={onClose}
                style={styles.close}
              >
                <CloseIcon size={18} color={colors.inkMuted} />
              </Pressable>
            </View>
          ) : null}
          {children}
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: alpha(colors.ink, 0.35),
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 0,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
    ...shadows.e3,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.borderStrong,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  headerCopy: { flex: 1, gap: spacing.xxs },
  close: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
  },
  footer: { gap: spacing.sm },
});
