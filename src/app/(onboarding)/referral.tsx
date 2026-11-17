import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Stepper } from '@/components/ui/Stepper';
import { TextField } from '@/components/ui/TextField';
import { useOnboarding } from '@/features/onboarding/OnboardingProvider';
import { colors, radius, spacing } from '@/theme';

const CODE_PATTERN = /^DIOKS-[A-Z0-9]{4}$/i;

export default function ReferralScreen() {
  const router = useRouter();
  const { draft, update } = useOnboarding();
  const [code, setCode] = useState(draft.referrerCode);
  const [error, setError] = useState<string | undefined>();

  function next(skip = false) {
    if (skip) {
      update({ referrerCode: '' });
      router.push('/done');
      return;
    }

    const trimmed = code.trim().toUpperCase();
    if (trimmed.length > 0 && !CODE_PATTERN.test(trimmed)) {
      setError('Codes look like DIOKS-AB12');
      return;
    }

    update({ referrerCode: trimmed });
    router.push('/done');
  }

  return (
    <Screen contentStyle={styles.content}>
      <Stepper step={4} />

      <View style={styles.headline}>
        <AppText variant="h1">Were you invited?</AppText>
        <AppText variant="body" color={colors.inkMuted}>
          If another tailor shared their code, enter it here. It is optional and changes nothing about your own data.
        </AppText>
      </View>

      <TextField
        label="Referral code"
        value={code}
        onChangeText={(text) => {
          setCode(text.toUpperCase());
          if (error) setError(undefined);
        }}
        placeholder="DIOKS-AB12"
        autoCapitalize="characters"
        autoCorrect={false}
        error={error}
        helper="You can add this later in Settings."
      />

      <Card style={styles.note}>
        <AppText variant="label">How invites work</AppText>
        <AppText variant="caption" color={colors.inkMuted}>
          When you subscribe, the tailor who invited you receives service credit toward their own renewal. Credits are
          not cash and never expire while your account is active.
        </AppText>
      </Card>

      <View style={styles.actions}>
        <Button label="Continue" onPress={() => next(false)} />
        <Pressable accessibilityRole="button" onPress={() => next(true)}>
          <AppText variant="label" color={colors.inkMuted} center>
            Skip for now
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xl, gap: spacing.lg },
  headline: { gap: spacing.sm, marginTop: spacing.sm },
  note: { backgroundColor: colors.surfaceMuted, gap: spacing.xxs, borderRadius: radius.md },
  actions: { gap: spacing.md, marginTop: spacing.sm },
});
