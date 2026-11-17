import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { BrandMark } from '@/components/ui/BrandMark';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/data';
import { useAuth } from '@/features/auth/AuthProvider';
import { hasErrors, validateSignIn, type FieldErrors } from '@/features/auth/validation';
import { alpha, colors, radius, spacing } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, busy, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  async function submit() {
    const nextErrors = validateSignIn({ email, password });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    try {
      const session = await signIn(email.trim(), password);
      router.replace(session.hasProfile ? '/home' : '/(onboarding)/welcome');
    } catch {
      // Provider surfaces the message.
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setErrors({});
    if (error) clearError();
  }

  return (
    <Screen contentStyle={styles.content} ambience="hero">
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backRow}>
        <AppText variant="label" color={colors.primary}>
          ← Back
        </AppText>
      </Pressable>

      <View style={styles.header}>
        <BrandMark size={46} />
        <AppText variant="h1" style={styles.title}>
          Welcome back
        </AppText>
        <AppText variant="body" color={colors.inkMuted}>
          Sign in to reach your customers, measurements and jobs.
        </AppText>
      </View>

      <View style={styles.form}>
        <TextField
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors({ ...errors, email: undefined });
            if (error) clearError();
          }}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          error={errors.email}
        />

        <TextField
          label="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors({ ...errors, password: undefined });
            if (error) clearError();
          }}
          placeholder="Your password"
          secureTextEntry={!showPassword}
          autoComplete="password"
          textContentType="password"
          onSubmitEditing={submit}
          error={errors.password}
          rightSlot={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              onPress={() => setShowPassword((value) => !value)}
              style={styles.showToggle}
            >
              <AppText variant="caption" color={colors.primary} weight="semiBold">
                {showPassword ? 'Hide' : 'Show'}
              </AppText>
            </Pressable>
          }
        />

        <Pressable accessibilityRole="button" onPress={() => router.push('/(auth)/forgot-password')}>
          <AppText variant="label" color={colors.primary}>
            Forgot password?
          </AppText>
        </Pressable>

        {error ? (
          <View style={styles.errorBanner}>
            <AppText variant="caption" color={colors.danger} accessibilityLiveRegion="polite">
              {error}
            </AppText>
          </View>
        ) : null}

        <Button label="Sign in" onPress={submit} loading={busy} />
      </View>

      <Card style={styles.demoCard}>
        <AppText variant="label">Demo accounts</AppText>
        <AppText variant="caption" color={colors.inkMuted}>
          Tap to fill. Password: {DEMO_PASSWORD}
        </AppText>
        <View style={styles.demoList}>
          {DEMO_ACCOUNTS.map((account) => (
            <Pressable
              key={account.key}
              accessibilityRole="button"
              accessibilityLabel={`Use the ${account.label} demo account`}
              onPress={() => fillDemo(account.email)}
              style={({ pressed }) => [styles.demoRow, pressed && styles.demoRowPressed]}
            >
              <View style={styles.demoCopy}>
                <AppText variant="label">{account.label}</AppText>
                <AppText variant="caption" color={colors.inkMuted}>
                  {account.email} · {account.hint}
                </AppText>
              </View>
              <AppText variant="caption" color={colors.primary} weight="semiBold">
                Use
              </AppText>
            </Pressable>
          ))}
        </View>
      </Card>

      <View style={styles.footer}>
        <Pressable accessibilityRole="button" onPress={() => router.replace('/(auth)/register')}>
          <AppText variant="label" color={colors.primary} center>
            New to DIOKS? Create an account
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.lg },
  backRow: { paddingVertical: spacing.sm, alignSelf: 'flex-start' },
  header: { marginTop: spacing.xl, gap: spacing.xs },
  title: { marginTop: spacing.sm },
  form: { marginTop: spacing.xxl, gap: spacing.lg },
  showToggle: { minHeight: 44, minWidth: 44, alignItems: 'flex-end', justifyContent: 'center' },
  errorBanner: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: alpha(colors.danger, 0.16),
    padding: spacing.md,
  },
  demoCard: { marginTop: spacing.xxl, backgroundColor: colors.surfaceMuted, gap: spacing.xs },
  demoList: { marginTop: spacing.sm, gap: spacing.xs },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    minHeight: 52,
  },
  demoRowPressed: { backgroundColor: colors.primarySoft },
  demoCopy: { flex: 1, gap: 1 },
  footer: { marginTop: spacing.xxl, marginBottom: spacing.lg },
});

