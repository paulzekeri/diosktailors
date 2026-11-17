import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { colors, radius, spacing } from '@/theme';

type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  error?: string;
};

export function Checkbox({ checked, onChange, label, error }: Props) {
  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={label}
        onPress={() => onChange(!checked)}
        style={styles.row}
      >
        <View style={[styles.box, checked && styles.boxChecked]}>
          {checked ? (
            <AppText variant="caption" weight="bold" color={colors.white}>
              ✓
            </AppText>
          ) : null}
        </View>
        <AppText variant="caption" color={colors.inkMuted} style={styles.label}>
          {label}
        </AppText>
      </Pressable>
      {error ? (
        <AppText variant="caption" color={colors.danger} accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, minHeight: 44 },
  box: {
    width: 22,
    height: 22,
    borderRadius: radius.xs - 2,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { flex: 1, paddingTop: 2 },
});
