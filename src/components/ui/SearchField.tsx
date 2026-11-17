import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { CloseIcon, SearchIcon } from './icons';
import { colors, fontFamily, layout, radius, spacing } from '@/theme';

type Props = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  accessibilityLabel?: string;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
  /** Validated by react-query after a debounce, so `false` keeps the keyboard open. */
  returnKeyType?: 'search' | 'done';
};

/** Search bar for list screens. Debounce the value with `useDebouncedValue`. */
export function SearchField({
  value,
  onChangeText,
  placeholder = 'Search',
  accessibilityLabel = 'Search',
  onSubmitEditing,
  autoFocus,
  returnKeyType = 'search',
}: Props) {
  return (
    <View style={styles.shell}>
      <SearchIcon size={18} color={colors.inkSubtle} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkSubtle}
        accessibilityLabel={accessibilityLabel}
        onSubmitEditing={onSubmitEditing}
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType={returnKeyType}
        style={styles.input}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={() => onChangeText('')}
          hitSlop={12}
          style={styles.clear}
        >
          <CloseIcon size={18} color={colors.inkMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    minHeight: layout.touchTarget + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: layout.touchTarget,
    color: colors.ink,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    paddingVertical: spacing.sm,
  },
  clear: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
