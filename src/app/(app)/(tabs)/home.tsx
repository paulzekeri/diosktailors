import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/StatusPill';
import { CheckIcon, CustomersIcon, DueIcon, ProjectsIcon } from '@/components/ui/icons';
import {
  repo,
  repositoryErrorCopy,
  toRepositoryError,
  type BusinessProfile,
  type Customer,
  type Reminder,
  type Subscription,
} from '@/data';
import { useAuth } from '@/features/auth/AuthProvider';
import { daysLeftLabel, dueLabel, formatLongDate } from '@/lib/date';
import { whatsappUrl } from '@/lib/phone';
import { alpha, colors, layout, radius, spacing } from '@/theme';

export default function HomeScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState({ customers: 0, active: 0, dueThisWeek: 0, completedThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      void (async () => {
        try {
          const [profile, sub, customerList, projects, due] = await Promise.all([
            repo.business.get(),
            repo.subscription.get(),
            repo.customers.list(),
            repo.projects.list('all'),
            repo.reminders.due(7),
          ]);
          if (!active) return;

          const monthPrefix = new Date().toISOString().slice(0, 7);
          setBusiness(profile);
          setSubscription(sub);
          setCustomers(customerList);
          setReminders(due);
          setStats({
            customers: customerList.length,
            active: projects.filter((p) => p.status === 'pending' || p.status === 'in_progress').length,
            dueThisWeek: due.filter((item) => item.kind === 'delivery').length,
            completedThisMonth: projects.filter(
              (p) => p.status === 'completed' && p.expectedDeliveryAt.startsWith(monthPrefix),
            ).length,
          });
          setError(null);
        } catch (caught) {
          if (active) setError(repositoryErrorCopy[toRepositoryError(caught).code]);
        } finally {
          if (active) setLoading(false);
        }
      })();

      return () => {
        active = false;
      };
    }, []),
  );

  const firstName = session?.fullName?.split(' ')[0] ?? 'there';
  const deliveries = reminders.filter((item) => item.kind === 'delivery').slice(0, 3);
  const celebrations = reminders.filter((item) => item.kind === 'birthday' || item.kind === 'anniversary');

  /** Subscription card copy — the trial shows a **days count**, never a percentage. */
  const subscriptionTitle =
    subscription?.status === 'trialing'
      ? 'Free trial'
      : subscription?.status === 'active'
        ? 'Subscription active'
        : subscription?.status === 'expired'
          ? 'Subscription expired'
          : subscription?.status === 'cancelled'
            ? 'Subscription cancelled'
            : '';

  const subscriptionDetail =
    subscription?.status === 'trialing'
      ? `Ends ${formatLongDate(subscription.trialEndsAt)} · everything unlocked`
      : subscription?.status === 'expired'
        ? 'Renew to create and edit. Your records are safe and readable.'
        : subscription?.currentPeriodEnd
          ? `${subscription.planName} · renews ${formatLongDate(subscription.currentPeriodEnd)}`
          : (subscription?.planName ?? '');

  const subscriptionBadge =
    subscription?.status === 'trialing'
      ? daysLeftLabel(subscription.trialEndsAt)
      : subscription?.status === 'active'
        ? 'Active'
        : subscription?.status === 'expired'
          ? 'Read-only'
          : 'Cancelled';

  const badgeTone =
    subscription?.status === 'active'
      ? { fg: colors.success, bg: colors.successSoft }
      : subscription?.status === 'expired'
        ? { fg: colors.danger, bg: colors.dangerSoft }
        : subscription?.status === 'cancelled'
          ? { fg: colors.inkMuted, bg: colors.surfaceMuted }
          : { fg: colors.warning, bg: colors.warningSoft };

  async function greet(item: Reminder) {
    const first = item.customerName.split(' ')[0];
    const message =
      item.kind === 'birthday'
        ? `Happy birthday ${first}! Wishing you a beautiful year ahead. — ${business?.businessName ?? ''}`
        : `Happy anniversary ${first}! Wishing you many more years together. — ${business?.businessName ?? ''}`;
    const url = whatsappUrl(item.phoneE164, message);
    if (url) await Linking.openURL(url);
  }

  return (
    <Screen contentStyle={styles.content} bottomPadding={spacing.xxl + layout.tabBarHeight}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <AppText variant="caption" color={colors.inkMuted}>
            {business?.businessName ?? 'Your studio'}
          </AppText>
          <AppText variant="display">Hello, {firstName}</AppText>
        </View>
        <View style={styles.avatarWrap}>
          <Avatar name={business?.businessName ?? firstName} uri={business?.logoUrl} size="lg" />
          <View style={styles.presence} />
        </View>
      </View>

      {subscription ? (
        <Card style={[styles.subscriptionCard, { backgroundColor: badgeTone.bg, borderColor: badgeTone.bg }]} texture>
          <View style={styles.subscriptionRow}>
            <View style={styles.subscriptionCopy}>
              <AppText variant="label">{subscriptionTitle}</AppText>
              <AppText variant="caption" color={colors.inkMuted}>
                {subscriptionDetail}
              </AppText>
            </View>
            <View style={[styles.subscriptionBadge, { borderColor: alpha(badgeTone.fg, 0.24) }]}>
              <AppText variant="caption" weight="semiBold" color={badgeTone.fg}>
                {subscriptionBadge}
              </AppText>
            </View>
          </View>
        </Card>
      ) : null}

      {loading ? (
        <Card style={styles.loadingCard}>
          <AppText variant="body" color={colors.inkMuted}>
            Loading your studio…
          </AppText>
        </Card>
      ) : error ? (
        <Card style={styles.loadingCard}>
          <AppText variant="body" color={colors.danger}>
            {error}
          </AppText>
        </Card>
      ) : (
        <>
          <View style={styles.statGrid}>
            {[
              { label: 'Customers', value: stats.customers, icon: <CustomersIcon size={18} color={colors.primary} /> },
              { label: 'Active jobs', value: stats.active, icon: <ProjectsIcon size={18} color={colors.primary} /> },
              { label: 'Due this week', value: stats.dueThisWeek, icon: <DueIcon size={18} color={colors.primary} /> },
              {
                label: 'Completed this month',
                value: stats.completedThisMonth,
                icon: <CheckIcon size={18} color={colors.primary} />,
              },
            ].map((item) => (
              <Card key={item.label} style={styles.statCard} texture>
                <View style={styles.statTop}>
                  <AppText variant="display" weight="bold" tabular>
                    {item.value}
                  </AppText>
                  <View style={styles.statIcon}>{item.icon}</View>
                </View>
                <AppText variant="caption" color={colors.inkMuted}>
                  {item.label}
                </AppText>
              </Card>
            ))}
          </View>

          <View style={styles.section}>
            <AppText variant="h3">Quick actions</AppText>
            <View style={styles.quickRow}>
              {[
                {
                  label: 'Add customer',
                  icon: <CustomersIcon size={18} color={colors.primary} />,
                  onPress: () => router.push('/customers/new' as never),
                },
                {
                  label: 'Customers',
                  icon: <CustomersIcon size={18} color={colors.inkMuted} />,
                  onPress: () => router.push('/customers' as never),
                },
                {
                  label: 'Due',
                  icon: <DueIcon size={18} color={colors.inkMuted} />,
                  onPress: () => router.push('/due' as never),
                },
              ].map((action) => (
                <Pressable
                  key={action.label}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  onPress={action.onPress}
                  style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
                >
                  {action.icon}
                  <AppText variant="caption" weight="semiBold" color={colors.ink} center numberOfLines={2}>
                    {action.label}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText variant="h3">Deliveries this week</AppText>
              <AppText variant="caption" color={colors.inkMuted}>
                {deliveries.length}
              </AppText>
            </View>
            {deliveries.length === 0 ? (
              <Card>
                <AppText variant="body" color={colors.inkMuted}>
                  Nothing due in the next seven days.
                </AppText>
              </Card>
            ) : (
              deliveries.map((item) => (
                <Card
                  key={item.id}
                  style={styles.dueCard}
                  accent={item.daysUntil < 0 ? 'danger' : undefined}
                  onPress={() => router.push(`/customers/${item.customerId}` as never)}
                  accessibilityLabel={`${item.projectName ?? 'Delivery'} for ${item.customerName}, ${dueLabel(item.daysUntil)}`}
                >
                  <View style={styles.dueCopy}>
                    <AppText variant="label">{item.projectName ?? item.customerName}</AppText>
                    <AppText variant="caption" color={colors.inkMuted}>
                      {item.customerName}
                    </AppText>
                    <View style={styles.dueMeta}>
                      <AppText variant="caption" color={item.daysUntil < 0 ? colors.danger : colors.inkMuted}>
                        {dueLabel(item.daysUntil)}
                      </AppText>
                      <AppText variant="caption" weight="semiBold" color={colors.primary}>
                        View details
                      </AppText>
                    </View>
                  </View>
                  {item.daysUntil < 0 ? <StatusPill status="overdue" /> : null}
                </Card>
              ))
            )}
          </View>

          {celebrations.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AppText variant="h3">Celebrations</AppText>
                <AppText variant="caption" color={colors.inkMuted}>
                  {celebrations.length}
                </AppText>
              </View>
              {celebrations.map((item) => (
                <Card key={item.id} style={styles.celebrationRow}>
                  <View style={styles.dueCopy}>
                    <AppText variant="label">{item.customerName}</AppText>
                    <AppText variant="caption" color={colors.inkMuted}>
                      {item.kind === 'birthday' ? 'Birthday' : 'Anniversary'} · {dueLabel(item.daysUntil)}
                    </AppText>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Send a WhatsApp greeting to ${item.customerName}`}
                    onPress={() => greet(item)}
                    style={styles.whatsappButton}
                  >
                    <AppText variant="caption" weight="semiBold" color={colors.white}>
                      Wish
                    </AppText>
                  </Pressable>
                </Card>
              ))}
            </View>
          ) : null}

          {customers.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AppText variant="h3">Recent customers</AppText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="See all customers"
                  onPress={() => router.push('/customers' as never)}
                  hitSlop={8}
                >
                  <AppText variant="caption" weight="semiBold" color={colors.primary}>
                    See all
                  </AppText>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.customerStrip}>
                {customers.slice(0, 6).map((customer) => (
                  <Pressable
                    key={customer.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${customer.fullName}`}
                    onPress={() => router.push(`/customers/${customer.id}` as never)}
                    style={styles.customerChip}
                  >
                    <Avatar name={customer.fullName} uri={customer.photoUrl} size="lg" />
                    <AppText variant="caption" center numberOfLines={2}>
                      {customer.fullName.split(' ')[0]}
                    </AppText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : (
            <Card style={styles.emptyCard} texture>
              <AppText variant="label">Your book is ready</AppText>
              <AppText variant="body" color={colors.inkMuted}>
                Add the first customer and their measurements stay on file forever.
              </AppText>
              <Button label="Add customer" onPress={() => router.push('/customers/new' as never)} />
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.lg, gap: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  headerCopy: { flex: 1, gap: spacing.xxs },
  avatarWrap: { alignItems: 'center', justifyContent: 'center' },
  /** Online dot on the business avatar — presence, not status. */
  presence: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 12,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: colors.canvas,
  },
  subscriptionCard: { paddingVertical: spacing.md },
  subscriptionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  subscriptionCopy: { flex: 1, gap: spacing.xxs },
  subscriptionBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  loadingCard: { minHeight: 96, justifyContent: 'center' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: {
    width: '48%',
    flexGrow: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.xxs,
  },
  statTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
  },
  section: { gap: spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  quickRow: { flexDirection: 'row', gap: spacing.sm },
  quickAction: {
    flex: 1,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  quickActionPressed: { backgroundColor: colors.surfaceMuted },
  dueCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  dueCopy: { flex: 1, gap: spacing.xxs },
  dueMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  celebrationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  whatsappButton: {
    backgroundColor: colors.whatsappDeep,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  customerStrip: { gap: spacing.lg, paddingVertical: spacing.xs },
  customerChip: { width: 64, alignItems: 'center', gap: spacing.xs },
  emptyCard: { gap: spacing.xs, backgroundColor: colors.surfaceMuted },
});


