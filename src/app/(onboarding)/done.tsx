import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Stepper } from '@/components/ui/Stepper';
import { repo, repositoryErrorCopy, STANDARD_TEMPLATES, toRepositoryError } from '@/data';
import { useAuth } from '@/features/auth/AuthProvider';
import { useOnboarding } from '@/features/onboarding/OnboardingProvider';
import { formatPhoneDisplay, toE164 } from '@/lib/phone';
import { colors, radius, spacing } from '@/theme';

export default function DoneScreen() {
  const router = useRouter();
  const { refresh } = useAuth();
  const { draft, reset } = useOnboarding();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const whatsapp = toE164(draft.whatsappInput) ?? draft.whatsappInput;
  const templateName = STANDARD_TEMPLATES.find((template) => template.key === draft.templateKey)?.name ?? '—';

  async function create() {
    setBusy(true);
    setError(null);
    try {
      await repo.business.create({
        businessName: draft.businessName || 'My Studio',
        whatsappNumber: whatsapp,
        phoneNumber: draft.phoneInput || undefined,
        email: draft.email || undefined,
        logoUrl: draft.logoUrl,
        address: draft.address || undefined,
        socialMedia: {
          instagram: draft.instagram || undefined,
          facebook: draft.facebook || undefined,
          tiktok: draft.tiktok || undefined,
        },
        registrationInfo: draft.registrationInfo || undefined,
        preferredUnit: draft.unit,
        templateKey: draft.templateKey,
        referrerCode: draft.referrerCode || undefined,
      });
      await refresh();
      reset();
      router.replace('/home');
    } catch (caught) {
      setError(repositoryErrorCopy[toRepositoryError(caught).code]);
    } finally {
      setBusy(false);
    }
  }

  if (!draft.businessName) {
    return (
      <Screen contentStyle={styles.content}>
        <Card style={styles.card}>
          <AppText variant="h2">Almost there</AppText>
          <AppText variant="body" color={colors.inkMuted}>
            We still need your business name and WhatsApp number before we can open your book.
          </AppText>
        </Card>
        <Button label="Go back to business details" onPress={() => router.replace('/business')} />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.content}>
      <Stepper step={4} />

      <View style={styles.headline}>
        <AppText variant="h1">Ready to open your book</AppText>
        <AppText variant="body" color={colors.inkMuted}>
          Check the details below. You can change all of this later in Settings.
        </AppText>
      </View>

      <Card style={styles.summary}>
        {[
          { label: 'Business', value: draft.businessName },
          { label: 'WhatsApp', value: formatPhoneDisplay(whatsapp) || '—' },
          { label: 'Measurement unit', value: draft.unit === 'inches' ? 'Inches' : 'Centimetres' },
          { label: 'Template', value: templateName },
          ...(draft.referrerCode ? [{ label: 'Referral', value: draft.referrerCode }] : []),
        ].map((row, index, rows) => (
          <View key={row.label} style={[styles.summaryRow, index < rows.length - 1 && styles.summaryDivider]}>
            <AppText variant="caption" color={colors.inkMuted}>
              {row.label}
            </AppText>
            <AppText variant="label" style={styles.summaryValue}>
              {row.value}
            </AppText>
          </View>
        ))}
      </Card>

      <View style={styles.reassurance}>
        {[
          'Your 14-day free trial starts now — no card needed.',
          'Customers never install anything; you message them on WhatsApp.',
          'Only you can see your customers and measurements.',
        ].map((line) => (
          <View key={line} style={styles.bulletRow}>
            <View style={styles.bullet} />
            <AppText variant="caption" color={colors.inkMuted} style={styles.bulletText}>
              {line}
            </AppText>
          </View>
        ))}
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <AppText variant="caption" color={colors.danger} accessibilityLiveRegion="polite">
            {error}
          </AppText>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button label="Open my studio" onPress={create} loading={busy} />
        <Button label="Edit business details" variant="ghost" onPress={() => router.push('/business')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xl, gap: spacing.lg },
  headline: { gap: spacing.sm },
  card: { gap: spacing.sm, marginBottom: spacing.xxl },
  summary: { gap: 0 },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  summaryDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryValue: { flex: 1, textAlign: 'right' },
  reassurance: { gap: spacing.sm },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  bullet: { width: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.success, marginTop: 7 },
  bulletText: { flex: 1 },
  errorBanner: { backgroundColor: colors.dangerSoft, borderRadius: radius.sm, padding: spacing.md },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
