import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { goBack } from '@/lib/navigation';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { TextField } from '@/components/ui/TextField';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  hasErrors,
  passwordStrength,
  validateSignUp,
  type FieldErrors,
  type SignUpValues,
} from '@/features/auth/validation';
import { alpha, colors, radius, spacing } from '@/theme';

const EMPTY: SignUpValues = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  referralCode: '',
  acceptedTerms: false,
};

const STRENGTH_COLOR = {
  weak: colors.danger,
  fair: colors.warning,
  good: colors.info,
  strong: colors.success,
} as const;

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, busy, error, clearError } = useAuth();
  const [values, setValues] = useState<SignUpValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function setField<K extends keyof SignUpValues>(key: K, value: SignUpValues[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (submitted) setErrors(validateSignUp(next));
    if (error) clearError();
  }

  const strength = passwordStrength(values.password);

  async function submit() {
    setSubmitted(true);
    const nextErrors = validateSignUp(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    try {
      await signUp({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
        referralCode: values.referralCode.trim() || undefined,
        acceptedTerms: values.acceptedTerms,
      });
      router.replace('/(onboarding)/welcome');
    } catch {
      // Provider surfaces repository copy.
    }
  }

  return (
    <Screen contentStyle={styles.content} ambience="hero">
      <Pressable accessibilityRole="button" onPress={() => goBack(router, "/login")} style={styles.backRow}>
        <AppText variant="label" color={colors.primary}>
          ← Back
        </AppText>
      </Pressable>

      <View style={styles.header}>
        <AppText variant="h1">Create your account</AppText>
        <AppText variant="body" color={colors.inkMuted}>
          Free for 14 days. No card needed.
        </AppText>
      </View>

      <View style={styles.form}>
        <TextField
          label="Full name"
          value={values.fullName}
          onChangeText={(text) => setField('fullName', text)}
          placeholder="Adaeze Okafor"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          error={errors.fullName}
        />

        <TextField
          label="Email"
          value={values.email}
          onChangeText={(text) => setField('email', text)}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          returnKeyType="next"
          error={errors.email}
        />

        <View style={styles.passwordBlock}>
          <TextField
            label="Password"
            value={values.password}
            onChangeText={(text) => setField('password', text)}
            placeholder="At least 8 characters"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            error={errors.password}
          />
          {values.password.length > 0 ? (
            <View style={styles.strengthRow}>
              <View style={styles.bars}>
                {[0, 1, 2, 3].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.bar,
                      {
                        backgroundColor:
                          index < strength.score ? STRENGTH_COLOR[strength.level] : colors.surfaceMuted,
                      },
                    ]}
                  />
                ))}
              </View>
              <AppText variant="caption" color={STRENGTH_COLOR[strength.level]}>
                {strength.label}
              </AppText>
            </View>
          ) : null}
        </View>

        <TextField
          label="Confirm password"
          value={values.confirmPassword}
          onChangeText={(text) => setField('confirmPassword', text)}
          placeholder="Type it again"
          secureTextEntry
          autoComplete="new-password"
          error={errors.confirmPassword}
        />

        <TextField
          label="Referral code (optional)"
          value={values.referralCode}
          onChangeText={(text) => setField('referralCode', text.toUpperCase())}
          placeholder="DIOKS-AB12"
          autoCapitalize="characters"
          autoCorrect={false}
          error={errors.referralCode}
          helper="A friend’s code earns them credit when you subscribe."
        />

        <Checkbox
          checked={values.acceptedTerms}
          onChange={(next) => setField('acceptedTerms', next)}
          label="I agree to the Terms of Service and Privacy Policy, and to DIOKS processing my customers’ measurements securely."
          error={errors.acceptedTerms}
        />

        {error ? (
          <View style={styles.errorBanner}>
            <AppText variant="caption" color={colors.danger} accessibilityLiveRegion="polite">
              {error}
            </AppText>
          </View>
        ) : null}

        <Button label="Create account" onPress={submit} loading={busy} />

        <Pressable accessibilityRole="button" onPress={() => router.replace('/(auth)/login')}>
          <AppText variant="label" color={colors.primary} center>
            I already have an account
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
  form: { marginTop: spacing.xxl, gap: spacing.lg },
  passwordBlock: { gap: spacing.xs },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  bars: { flexDirection: 'row', gap: spacing.xs, flex: 1 },
  bar: { flex: 1, height: 4, borderRadius: radius.full },
  errorBanner: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: alpha(colors.danger, 0.16),
    padding: spacing.md,
  },
});

