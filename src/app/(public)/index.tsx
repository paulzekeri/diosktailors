import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { BrandMark } from '@/components/ui/BrandMark';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, radius, spacing } from '@/theme';

const BENEFITS = [
  {
    n: '01',
    title: 'Measure once, keep it forever',
    body: 'Measurements are versioned. Re-measure in six months and the old numbers are still there to compare.',
  },
  {
    n: '02',
    title: 'Jobs that never get forgotten',
    body: 'Every order is a project with a delivery date. Completed and delivered stay separate — nothing archives by accident.',
  },
  {
    n: '03',
    title: 'WhatsApp, one tap away',
    body: 'Open the customer’s chat with the message already written — from your own number, so it still feels personal.',
  },
];

const SAMPLE = [
  { label: 'Bust', value: '38' },
  { label: 'Waist', value: '32½' },
  { label: 'Hip', value: '41' },
  { label: 'Gown length', value: '58' },
];

export default function LandingScreen() {
  const router = useRouter();

  return (
    <Screen contentStyle={styles.content} ambience="hero">
      <View style={styles.brandRow}>
        <BrandMark size={40} />
        <View>
          <AppText variant="label" weight="bold">
            DIOKS
          </AppText>
          <AppText variant="caption" color={colors.inkMuted}>
            FashionSuite
          </AppText>
        </View>
        <View style={styles.brandSpacer} />
        <View style={styles.brandRule} />
      </View>

      <View style={styles.hero}>
        <AppText variant="display">Your measurement book can’t get lost.</AppText>
        <AppText variant="bodyLg" color={colors.inkMuted} style={styles.heroBody}>
          Customer measurements, job details and WhatsApp follow-ups in one private place — on this phone, and on the
          next one.
        </AppText>
      </View>

      <View style={styles.ctaGroup}>
        <Button label="Start free for 14 days" onPress={() => router.push('/(auth)/login')} />
        <Button
          label="View the design system"
          variant="secondary"
          onPress={() => router.push('/dev/gallery')}
          accessibilityHint="Opens the component gallery used for design review"
        />
      </View>

      <AppText variant="caption" color={colors.inkMuted} center style={styles.trustLine}>
        Built for one-handed use · Works offline · Your customers stay private
      </AppText>

      <Card elevated style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <View>
            <AppText variant="label">Adaeze Okafor</AppText>
            <AppText variant="caption" color={colors.inkMuted}>
              Wedding gown · v3 · 12 Nov
            </AppText>
          </View>
          <View style={styles.unitBadge}>
            <AppText variant="micro" color={colors.primary}>
              in
            </AppText>
          </View>
        </View>
        <View style={styles.sampleGrid}>
          {SAMPLE.map((item) => (
            <View key={item.label} style={styles.sampleCell}>
              <AppText variant="caption" color={colors.inkMuted}>
                {item.label}
              </AppText>
              <AppText variant="h2" weight="bold" tabular>
                {item.value}
              </AppText>
            </View>
          ))}
        </View>
      </Card>

      <View style={styles.section}>
        <AppText variant="h3">Built for the way tailors work</AppText>
        {BENEFITS.map((b) => (
          <View key={b.n} style={styles.benefitRow}>
            <View style={styles.benefitBadge}>
              <AppText variant="caption" color={colors.primary}>
                {b.n}
              </AppText>
            </View>
            <View style={styles.benefitCopy}>
              <AppText variant="label">{b.title}</AppText>
              <AppText variant="body" color={colors.inkMuted}>
                {b.body}
              </AppText>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <AppText variant="caption" color={colors.inkSubtle} center>
          DIOKS TAILORS · Lagos, Nigeria
        </AppText>
        <AppText variant="caption" color={colors.inkSubtle} center>
          Preview build · Phase 1 (design system)
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.lg },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandSpacer: { flex: 1 },
  brandRule: { width: 28, height: 2, borderRadius: radius.full, backgroundColor: colors.gold },
  hero: { marginTop: spacing.xxxl },
  heroBody: { marginTop: spacing.md },
  ctaGroup: { marginTop: spacing.xxl, gap: spacing.sm },
  trustLine: { marginTop: spacing.md },
  previewCard: { marginTop: spacing.xxl },
  previewHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  unitBadge: {
    backgroundColor: colors.primarySoft, borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2, paddingVertical: spacing.xs,
  },
  sampleGrid: { marginTop: spacing.lg, flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.lg },
  sampleCell: { width: '50%', gap: 2 },
  section: { marginTop: spacing.xxxl, gap: spacing.xl },
  benefitRow: { flexDirection: 'row', gap: spacing.md },
  benefitBadge: {
    width: 28, height: 28, borderRadius: radius.xs, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  benefitCopy: { flex: 1, gap: spacing.xxs },
  footer: { marginTop: spacing.huge, gap: spacing.xs, paddingBottom: spacing.lg },
});
