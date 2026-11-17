import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { colors, layout, radius, shadows, spacing } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'whatsapp';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  accessibilityHint?: string;
};

const VARIANTS: Record<
  Variant,
  { container: ViewStyle; text: string; spinner: string; shadow?: ViewStyle; gloss?: string }
> = {
  primary: {
    container: { backgroundColor: colors.primary },
    text: colors.white,
    spinner: colors.white,
    shadow: shadows.brand,
    gloss: 'rgba(255,255,255,0.24)',
  },
  secondary: {
    container: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong },
    text: colors.ink,
    spinner: colors.primary,
    shadow: shadows.ambient,
  },
  ghost: { container: { backgroundColor: 'transparent' }, text: colors.primary, spinner: colors.primary },
  danger: {
    container: { backgroundColor: colors.danger },
    text: colors.white,
    spinner: colors.white,
    shadow: { shadowColor: colors.danger, shadowOpacity: 0.2, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
    gloss: 'rgba(255,255,255,0.2)',
  },
  whatsapp: {
    container: { backgroundColor: colors.whatsappDeep },
    text: colors.white,
    spinner: colors.white,
    shadow: { shadowColor: colors.whatsappDeep, shadowOpacity: 0.2, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 5 },
    gloss: 'rgba(255,255,255,0.2)',
  },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  icon,
  accessibilityHint,
}: Props) {
  const v = VARIANTS[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        v.container,
        !isDisabled && v.shadow,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {v.gloss ? (
        <View pointerEvents="none" style={[styles.gloss, { backgroundColor: v.gloss }]} />
      ) : null}
      {loading ? (
        <ActivityIndicator color={v.spinner} />
      ) : (
        <View style={styles.content}>
          {icon}
          <AppText variant="bodyLg" weight="semiBold" color={v.text} style={styles.label}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.buttonHeight,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { letterSpacing: 0.1 },
  gloss: {
    position: 'absolute',
    top: 1,
    left: spacing.lg,
    right: spacing.lg,
    height: 1,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.4 },
});
