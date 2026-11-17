import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { repo, repositoryErrorCopy, toRepositoryError } from '@/data';
import { validatePassword } from '@/features/auth/validation';
import { alpha, colors, radius, spacing } from '@/theme';

/**
 * Reached from the reset email (web) or the deep link
 * `dioksfashionsuite://reset-password?token=…` (native).
 * Phase 11 swaps the mock call for `supabase.auth.updateUser`.
 */
export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const passwordError = validatePassword(password);
  const confirmError = password !== confirm ? 'Passwords do not match' : undefined;
  const invalidLink = !token || token.length < 6;

  async function submit() {
    if (passwordError || confirmError || invalidLink) return;
    setBusy(true);
    setError(null);
    try {
      await repo.auth.resetPassword(String(token), password);
      setDone(true);
    } catch (caught) {
      setError(repositoryErrorCopy[toRepositoryError(caught).code]);
    } finally {
      setBusy(false);
    }
  }

  if (invalidLink) {
    return (
      <Screen contentStyle={styles.content} ambience="hero">
        <Card style={styles.card}>
          <AppText variant="h2">This link has expired</AppText>
          <AppText variant="body" color={colors.inkMuted}>
            Reset links are valid for 30 minutes. Request a new one to continue.
          </AppText>
        </Card>
        <Button label="Request a new link" onPress={() => router.replace('/(auth)/forgot-password')} />
      </Screen>
    );
  }

  if (done) {
    return (
      <Screen contentStyle={styles.content} ambience="hero">
        <Card style={styles.card}>
          <AppText variant="h2">Password updated</AppText>
          <AppText variant="body" color={colors.inkMuted}>
            You can now sign in with your new password. Your records are untouched.
          </AppText>
        </Card>
        <Button label="Sign in" onPress={() => router.replace('/(auth)/login')} />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.content} ambience="hero">
      <View style={styles.header}>
        <AppText variant="h1">Choose a new password</AppText>
        <AppText variant="body" color={colors.inkMuted}>
          Use at least 8 characters. A phrase you will remember beats a short random one.
        </AppText>
      </View>

      <View style={styles.form}>
        <TextField
          label="New password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          error={password.length > 0 ? passwordError : undefined}
        />
        <TextField
          label="Confirm new password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          autoComplete="new-password"
          error={confirm.length > 0 ? confirmError : undefined}
        />

        {error ? (
          <View style={styles.errorBanner}>
            <AppText variant="caption" color={colors.danger} accessibilityLiveRegion="polite">
              {error}
            </AppText>
          </View>
        ) : null}

        <Button label="Update password" onPress={submit} loading={busy} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xxxl },
  header: { gap: spacing.sm },
  form: { marginTop: spacing.xxl, gap: spacing.lg },
  card: { gap: spacing.sm, marginBottom: spacing.xxl },
  errorBanner: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: alpha(colors.danger, 0.16),
    padding: spacing.md,
  },
});
