import { useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from './AppText';
import { alpha, colors, fontFamily, layout, radius, shadows, spacing } from '@/theme';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
  helper?: string;
  rightSlot?: ReactNode;
};

export function TextField({ label, error, helper, rightSlot, onFocus, onBlur, ...inputProps }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <AppText variant="label" color={colors.inkMuted}>
        {label}
      </AppText>
      <View
        style={[
          styles.inputShell,
          focused && styles.focused,
          Boolean(error) && styles.invalid,
        ]}
      >
        <View pointerEvents="none" style={styles.wellShade} />
        <TextInput
          {...inputProps}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          placeholderTextColor={colors.inkSubtle}
          style={styles.input}
          accessibilityLabel={inputProps.accessibilityLabel ?? label}
        />
        {rightSlot}
      </View>
      {error ? (
        <AppText variant="caption" color={colors.danger} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : helper ? (
        <AppText variant="caption" color={colors.inkSubtle}>
          {helper}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs + 2 },
  inputShell: {
    minHeight: layout.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceWell,
  },
  /** A 6px inner shade sells the recess without an inset-shadow API. */
  wellShade: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    height: 6,
    borderTopLeftRadius: radius.sm - 1,
    borderTopRightRadius: radius.sm - 1,
    backgroundColor: alpha(colors.ink, 0.022),
  },
  focused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    ...shadows.focus,
  },
  invalid: { borderColor: colors.danger, backgroundColor: colors.surface },
  input: {
    flex: 1,
    minHeight: layout.inputHeight,
    color: colors.ink,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    paddingVertical: spacing.md,
  },
});
