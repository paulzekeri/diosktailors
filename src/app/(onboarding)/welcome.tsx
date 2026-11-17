import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { BrandMark } from '@/components/ui/BrandMark';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Stepper } from '@/components/ui/Stepper';
import { useAuth } from '@/features/auth/AuthProvider';
import { colors, radius, spacing } from '@/theme';

const STEPS = [
  { n: '01', title: 'Business profile', body: 'Name, WhatsApp number and logo — what your customers see.' },
  { n: '02', title: 'Measurement template', body: 'Start with Women, Men or Children, then rename anything.' },
  { n: '03', title: 'First customer', body: 'Add a customer and their measurements in under two minutes.' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();

  const hasProfile = session?.hasProfile ?? false;
  const firstName = session?.fullName?.split(' ')[0] ?? 'there';

  return (
    <Screen contentStyle={styles.content} ambience="hero">
      <Stepper step={1} />

      <View style={styles.headline}>
        <BrandMark size={44} />
        <AppText variant="h1" style={styles.title}>
          Welcome, {firstName}
        </AppText>
        <AppText variant="bodyLg" color={colors.inkMuted}>
          Three short steps and your measurement book is ready. About two minutes.
        </AppText>
      </View>

      <Card style={styles.steps}>
        {STEPS.map((step) => (
          <View key={step.n} style={styles.stepRow}>
            <View style={styles.badge}>
              <AppText variant="caption" color={colors.primary}>
                {step.n}
              </AppText>
            </View>
            <View style={styles.stepCopy}>
              <AppText variant="label">{step.title}</AppText>
              <AppText variant="body" color={colors.inkMuted}>
                {step.body}
              </AppText>
            </View>
          </View>
        ))}
      </Card>

      <View style={styles.actions}>
        {hasProfile ? (
          <Button label="Go to my dashboard" onPress={() => router.replace('/home')} />
        ) : (
          <Button label="Set up my business" onPress={() => router.push('/business')} />
        )}

        <Button
          label="Sign out"
          variant="ghost"
          onPress={async () => {
            await signOut();
            router.replace('/');
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xl, gap: spacing.lg },
  headline: { gap: spacing.xs, marginTop: spacing.sm },
  title: { marginTop: spacing.sm },
  steps: { gap: spacing.lg, backgroundColor: colors.surfaceMuted },
  stepRow: { flexDirection: 'row', gap: spacing.md },
  badge: {
    width: 28,
    height: 28,
    borderRadius: radius.xs,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepCopy: { flex: 1, gap: spacing.xxs },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
