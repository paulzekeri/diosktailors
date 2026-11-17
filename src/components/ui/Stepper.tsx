import { StyleSheet, View } from 'react-native';

import { AppText } from '../ui/AppText';
import { colors, radius, spacing } from '@/theme';

export function Stepper({ step, total = 4 }: { step: number; total?: number }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        {Array.from({ length: total }).map((_, index) => (
          <View key={index} style={[styles.segment, index < step && styles.segmentDone]}>
            {index < step ? <View pointerEvents="none" style={styles.gloss} /> : null}
          </View>
        ))}
      </View>
      <AppText variant="caption" color={colors.inkMuted}>
        Step {step} of {total}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs + 2 },
  track: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: 3,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  segment: {
    flex: 1,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  segmentDone: { backgroundColor: colors.primary },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});
