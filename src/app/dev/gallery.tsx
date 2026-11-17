import { useRouter } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { BrandMark } from '@/components/ui/BrandMark';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchField } from '@/components/ui/SearchField';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton, SkeletonRow, SkeletonText } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { Stepper } from '@/components/ui/Stepper';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { Wash } from '@/components/ui/Wash';
import { CustomersIcon } from '@/components/ui/icons';
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
  const toast = useToast();
  const [segment, setSegment] = useState<'measurements' | 'projects' | 'details'>('measurements');
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

      <Section title="Loading skeletons">
        <Skeleton width={140} height={12} />
        <SkeletonText lines={3} />
        <SkeletonRow />
        <AppText variant="caption" color={colors.inkSubtle}>
          Never spin for more than 400 ms without one of these.
        </AppText>
      </Section>

      <Section title="Segmented tabs">
        <SegmentedTabs
          accessibilityLabel="Customer sections"
          value={segment}
          onChange={setSegment}
          options={[
            { value: 'measurements', label: 'Measurements', count: 6 },
            { value: 'projects', label: 'Projects', count: 3 },
            { value: 'details', label: 'Details' },
          ]}
        />
        <AppText variant="caption" color={colors.inkSubtle}>
          Active segment: <AppText variant="caption" weight="semiBold">{segment}</AppText>
        </AppText>
      </Section>

      <Section title="Search">
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder="Name or phone number"
          accessibilityLabel="Search customers"
        />
      </Section>

      <Section title="Empty and error states">
        <EmptyState
          icon={<CustomersIcon size={26} color={colors.primary} />}
          title="No customers yet"
          description="Add your first customer and their measurements stay on file forever."
          actionLabel="Add customer"
          onAction={() => undefined}
        />
        <EmptyState
          tone="error"
          title="Could not load customers"
          description="Your records are safe. Check your connection and try again."
          actionLabel="Try again"
          onAction={() => undefined}
        />
      </Section>

      <Section title="Toast and sheets">
        <Button
          label="Show toast"
          variant="secondary"
          onPress={() =>
            toast.show({
              message: 'Saved as v3 · v2 kept in history',
              actionLabel: 'Undo',
              onAction: () => undefined,
            })
          }
        />
        <Button label="Open sheet" variant="secondary" onPress={() => setSheetOpen(true)} />
        <Button label="Confirm delivery" variant="secondary" onPress={() => setConfirmOpen(true)} />
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

      <Sheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="New measurement"
        subtitle="Version 3 · 18 fields"
        footer={<Button label="Save new version" onPress={() => setSheetOpen(false)} />}
      >
        <AppText variant="body" color={colors.inkMuted}>
          Create flows open as modals with a close affordance and an unsaved-changes guard.
        </AppText>
      </Sheet>

      <ConfirmDialog
        visible={confirmOpen}
        title="Mark as delivered?"
        message="This does not archive the job. Archive when you have handed it over."
        confirmLabel="Mark delivered"
        onConfirm={() => {
          setConfirmOpen(false);
          toast.show({
            message: 'Delivered. Archive when you’ve handed it over.',
            actionLabel: 'Archive',
            onAction: () => undefined,
            tone: 'success',
          });
        }}
        onCancel={() => setConfirmOpen(false)}
      />
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
