import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { alpha, colors, radius, shadows } from '@/theme';

const SIZES = { sm: 32, md: 40, lg: 56, xl: 96 } as const;

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

type Props = {
  name: string;
  uri?: string;
  size?: keyof typeof SIZES;
  /** Highlight ring used for "due today" customers. */
  ring?: boolean;
};

export function Avatar({ name, uri, size = 'md', ring = false }: Props) {
  const px = SIZES[size];

  return (
    <View
      style={[
        styles.wrapper,
        size !== 'sm' && shadows.ambient,
        ring && styles.ring,
        { width: px + (ring ? 6 : 0), height: px + (ring ? 6 : 0), borderRadius: radius.full },
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{
            width: px,
            height: px,
            borderRadius: radius.full,
            borderWidth: 1,
            borderColor: colors.highlight,
          }}
          contentFit="cover"
          transition={120}
          accessibilityLabel={name}
        />
      ) : (
        <View
          style={[styles.fallback, { width: px, height: px, borderRadius: radius.full }]}
          accessibilityLabel={name}
        >
          <View pointerEvents="none" style={styles.sheen} />
          <AppText
            variant={size === 'xl' ? 'h1' : size === 'lg' ? 'h3' : 'label'}
            weight="semiBold"
            color={colors.primary}
          >
            {initialsOf(name)}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  ring: { borderWidth: 2, borderColor: colors.warning, backgroundColor: colors.surface },
  fallback: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: alpha(colors.primary, 0.14),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
});
