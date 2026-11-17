import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { repo, type BusinessProfile, type Subscription } from '@/data';
import { useAuth } from '@/features/auth/AuthProvider';
import { daysLeftLabel } from '@/lib/date';
import { formatPhoneDisplay } from '@/lib/phone';
import { colors, layout, radius, shadows, spacing } from '@/theme';

const UPCOMING = [
  { label: 'Business profile & logo', phase: 'Phase 7' },
  { label: 'Preferences & notifications', phase: 'Phase 7' },
  { label: 'Subscription & billing', phase: 'Phase 7' },
  { label: 'Refer & earn', phase: 'Phase 7' },
  { label: 'Export my data', phase: 'Phase 15' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        const [profile, sub] = await Promise.all([repo.business.get(), repo.subscription.get()]);
        if (!active) return;
        setBusiness(profile);
        setSubscription(sub);
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  async function leave() {
    await signOut();
    router.replace('/');
  }

  return (
    <Screen contentStyle={styles.content} bottomPadding={spacing.xxl + layout.tabBarHeight}>
      <AppText variant="h1">Settings</AppText>

      <Card style={styles.businessCard} accent="gold">
        <Avatar name={business?.businessName ?? 'Studio'} uri={business?.logoUrl} size="lg" />
        <View style={styles.businessCopy}>
          <AppText variant="label">{business?.businessName ?? 'Your studio'}</AppText>
          <AppText variant="caption" color={colors.inkMuted}>
            {formatPhoneDisplay(business?.whatsappNumber)}
          </AppText>
          <AppText variant="caption" color={colors.inkSubtle}>
            Referral code {business?.referralCode ?? '—'}
          </AppText>
        </View>
      </Card>

      <Card style={styles.subCard}>
        <View style={styles.subRow}>
          <AppText variant="caption" color={colors.inkMuted}>
            Subscription
          </AppText>
          <AppText variant="label">
            {subscription?.status === 'trialing'
              ? 'Free trial'
              : subscription?.status === 'active'
                ? 'Active'
                : subscription?.status === 'expired'
                  ? 'Expired'
                  : 'Cancelled'}
          </AppText>
        </View>
        <AppText variant="caption" color={colors.inkMuted}>
          {subscription?.status === 'trialing'
            ? `${daysLeftLabel(subscription.trialEndsAt)} · one plan, all core features`
            : subscription?.status === 'expired'
              ? 'Renew to create and edit. Your records are safe.'
              : 'Everything in one place'}
        </AppText>
      </Card>

      <View style={styles.list}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Measurement templates"
          onPress={() => router.push('/templates' as never)}
          style={styles.row}
        >
          <AppText variant="body">Measurement templates</AppText>
          <AppText variant="caption" weight="semiBold" color={colors.primary}>
            Edit
          </AppText>
        </Pressable>
        {UPCOMING.map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            style={styles.row}
          >
            <AppText variant="body" color={colors.inkMuted}>
              {item.label}
            </AppText>
            <AppText variant="caption" color={colors.inkSubtle}>
              {item.phase}
            </AppText>
          </Pressable>
        ))}
      </View>

      <Button label="Sign out" variant="secondary" onPress={leave} />

      <View style={styles.footer}>
        <AppText variant="caption" color={colors.inkSubtle} center>
          DIOKS FashionSuite · Preview build · Phase 3
        </AppText>
        <AppText variant="caption" color={colors.inkSubtle} center>
          DIOKS TAILORS · Lagos, Nigeria
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.lg, gap: spacing.lg },
  businessCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  businessCopy: { flex: 1, gap: spacing.xxs },
  subCard: { gap: spacing.xxs },
  subRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.ambient,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  footer: { gap: spacing.xs, marginTop: spacing.sm },
});
