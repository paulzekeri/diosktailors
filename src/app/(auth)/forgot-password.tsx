import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { goBack } from '@/lib/navigation';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/features/auth/AuthProvider';
import { validateEmail } from '@/features/auth/validation';
import { alpha, colors, radius, spacing } from '@/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { requestReset, busy, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);

  async function submit() {
    const nextError = validateEmail(email);
    setFieldError(nextError);
    if (nextError) return;

    try {
      await requestReset(email.trim());
      setSent(true);
    } catch {
      // Provider shows the message.
    }
  }

  if (sent) {
    return (
      <Screen contentStyle={styles.content} ambience="hero">
        <Card elevated style={styles.sentCard}>
          <AppText variant="h2">Check your inbox</AppText>
          <AppText variant="body" color={colors.inkMuted}>
            If an account exists for {email.trim()}, we have sent a reset link. It expires in 30 minutes.
          </AppText>
          <AppText variant="caption" color={colors.inkSubtle}>
            Nothing yet? Check spam, or try again in a minute.
          </AppText>
        </Card>

        <View style={styles.actions}>
          <Button label="Back to sign in" onPress={() => router.replace('/(auth)/login')} />
          <Button
            label="Use a different email"
            variant="ghost"
            onPress={() => {
              setSent(false);
              setEmail('');
            }}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.content} ambience="hero">
      <Pressable accessibilityRole="button" onPress={() => goBack(router, "/login")} style={styles.backRow}>
        <AppText variant="label" color={colors.primary}>
          ← Back
        </AppText>
      </Pressable>

      <View style={styles.header}>
        <AppText variant="h1">Reset your password</AppText>
        <AppText variant="body" color={colors.inkMuted}>
          Enter the email you signed up with and we will send a reset link.
        </AppText>
      </View>

      <View style={styles.form}>
        <TextField
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (fieldError) setFieldError(undefined);
            if (error) clearError();
          }}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          error={fieldError}
          onSubmitEditing={submit}
        />

        {error ? (
          <View style={styles.errorBanner}>
            <AppText variant="caption" color={colors.danger} accessibilityLiveRegion="polite">
              {error}
            </AppText>
          </View>
        ) : null}

        <Button label="Send reset link" onPress={submit} loading={busy} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.lg },
  backRow: { paddingVertical: spacing.sm, alignSelf: 'flex-start' },
  header: { marginTop: spacing.xl, gap: spacing.sm },
  form: { marginTop: spacing.xxl, gap: spacing.lg },
  actions: { marginTop: spacing.xxl, gap: spacing.sm },
  sentCard: { marginTop: spacing.xxxl, gap: spacing.sm },
  errorBanner: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: alpha(colors.danger, 0.16),
    padding: spacing.md,
  },
});
