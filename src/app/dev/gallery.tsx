import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { BrandMark } from '@/components/ui/BrandMark';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/StatusPill';
import { Stepper } from '@/components/ui/Stepper';
import { TextField } from '@/components/ui/TextField';
import { Wash } from '@/components/ui/Wash';
import { colors, radius, spacing, statusTheme, typography, type ProjectStatus, type TextVariant } from '@/theme';

const SWATCHES = [
  ['canvas', colors.canvas],
  ['surface', colors.surface],
  ['surfaceMuted', colors.surfaceMuted],
  ['border', colors.border],
  ['ink', colors.ink],
  ['inkMuted', colors.inkMuted],
  ['primary', colors.primary],
  ['primarySoft', colors.primarySoft],
  ['gold', colors.gold],
  ['success', colors.success],
  ['warning', colors.warning],
  ['danger', colors.danger],
  ['info', colors.info],
  ['violet', colors.violet],
  ['whatsapp', colors.whatsapp],
  ['whatsappDeep', colors.whatsappDeep],
] as const;

const VARIANTS: TextVariant[] = ['display', 'h1', 'h2', 'h3', 'bodyLg', 'body', 'label', 'caption', 'micro'];
const STATUSES: ProjectStatus[] = ['pending', 'in_progress', 'completed', 'delivered', 'archived', 'overdue'];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="h3">{title}</AppText>
      {children}
    </View>
  );
}

export default function GalleryScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="h1">Design system</AppText>
        <AppText variant="body" color={colors.inkMuted}>
          430px shell · wine on warm paper · Plus Jakarta Sans
        </AppText>
      </View>

      <Button label="Back to landing" variant="ghost" onPress={() => router.back()} fullWidth={false} />

      <Section title="Brand & ambience">
        <View style={styles.row}>
          <BrandMark size={40} />
          <BrandMark size={56} />
          <BrandMark size={72} />
        </View>
        <View style={styles.ambience}>
          <Wash variant="hero" />
          <AppText variant="caption" color={colors.inkMuted}>
            Hero ambience — decorative only, always behind content, never carrying meaning.
          </AppText>
        </View>
      </Section>

      <Section title="Colour tokens">
        <View style={styles.swatchGrid}>
          {SWATCHES.map(([name, hex]) => (
            <View key={name} style={styles.swatchCell}>
              <View style={[styles.swatch, { backgroundColor: hex }]} />
              <AppText variant="caption" color={colors.inkMuted}>
                {name}
              </AppText>
              <AppText variant="caption" color={colors.inkSubtle}>
                {hex}
              </AppText>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Type scale">
        {VARIANTS.map((v) => (
          <View key={v} style={styles.typeRow}>
            <AppText variant={v}>Aa — {v}</AppText>
            <AppText variant="caption" color={colors.inkSubtle}>
              {typography[v].fontSize}px
            </AppText>
          </View>
        ))}
      </Section>

      <Section title="Buttons">
        <Button label="Primary action" />
        <Button label="Secondary" variant="secondary" />
        <Button label="Ghost" variant="ghost" />
        <Button label="WhatsApp" variant="whatsapp" />
        <Button label="Destructive" variant="danger" />
        <Button label="Loading" loading />
        <Button label="Disabled" disabled />
      </Section>

      <Section title="Status pills">
        <View style={styles.wrap}>
          {STATUSES.map((s) => (
            <StatusPill key={s} status={s} />
          ))}
        </View>
        <AppText variant="caption" color={colors.inkSubtle}>
          Labels always accompany colour: {statusTheme.completed.label}
        </AppText>
      </Section>

      <Section title="Avatars">
        <View style={styles.row}>
          <Avatar name="Adaeze Okafor" size="sm" />
          <Avatar name="Bola Adeyemi" size="md" />
          <Avatar name="Chidi Nwosu" size="lg" />
          <Avatar name="Funke A." size="xl" ring />
        </View>
      </Section>

      <Section title="Cards">
        <Card>
          <AppText variant="label">List row card</AppText>
          <AppText variant="body" color={colors.inkMuted}>
            Surface, 18px radius, 1px border, 16px padding, resting ambient shadow.
          </AppText>
        </Card>
        <Card elevated onPress={() => undefined} accessibilityLabel="Elevated example card">
          <AppText variant="label">Pressable card</AppText>
          <AppText variant="body" color={colors.inkMuted}>
            Used for customers, projects and reminders.
          </AppText>
        </Card>
        <Card tone="muted">
          <AppText variant="label">Muted tone</AppText>
          <AppText variant="caption" color={colors.inkMuted}>
            Quiet notes and read-only previews.
          </AppText>
        </Card>
        <Card tone="brand">
          <AppText variant="label">Brand tone</AppText>
          <AppText variant="caption" color={colors.inkMuted}>
            The highlighted row on a screen.
          </AppText>
        </Card>
        <Card accent="gold">
          <AppText variant="label">Accent rule</AppText>
          <AppText variant="caption" color={colors.inkMuted}>
            3px leading edge: primary, gold or danger.
          </AppText>
        </Card>
        <Card flat>
          <AppText variant="label">Flat</AppText>
          <AppText variant="caption" color={colors.inkMuted}>
            Nested surfaces opt out of the resting shadow.
          </AppText>
        </Card>
      </Section>

      <Section title="Fields">
        <TextField label="Email" placeholder="you@example.com" helper="Labels stay visible above every input." />
        <TextField label="Password" placeholder="Your password" error="Passwords do not match" />
      </Section>

      <Section title="Progress">
        <Stepper step={2} />
        <Stepper step={4} />
      </Section>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.footerNote}>
        <AppText variant="caption" color={colors.inkSubtle}>
          Phase 1 gate: verified at 320 / 360 / 390 / 430 / 768 / 1280 · no horizontal overflow · 44px targets
        </AppText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs, marginBottom: spacing.lg },
  section: { marginTop: spacing.xxl, gap: spacing.md },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md },
  swatchCell: { width: '25%', gap: 2 },
  swatch: {
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  ambience: {
    height: 132,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.canvas,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  footerNote: { marginTop: spacing.xxl, maxHeight: 80 },
});
