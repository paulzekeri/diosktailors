import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/StatusPill';
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
import { daysLeftLabel, dueLabel } from '@/lib/date';
import { whatsappUrl } from '@/lib/phone';
import { colors, layout, radius, shadows, spacing } from '@/theme';

export default function HomeScreen() {
  const { session } = useAuth();
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
          <AppText variant="h1">Hello, {firstName}</AppText>
        </View>
        <Avatar name={business?.businessName ?? firstName} uri={business?.logoUrl} size="lg" />
      </View>

      {subscription ? (
        <View
          style={[
            styles.banner,
            subscription.status === 'trialing' && styles.bannerWarning,
            subscription.status === 'active' && styles.bannerSuccess,
            subscription.status === 'expired' && styles.bannerDanger,
          ]}
        >
          <AppText variant="label">
            {subscription.status === 'trialing'
              ? `Free trial · ${daysLeftLabel(subscription.trialEndsAt)}`
              : subscription.status === 'active'
                ? 'Subscription active'
                : subscription.status === 'expired'
                  ? 'Subscription expired'
                  : 'Subscription cancelled'}
          </AppText>
          <AppText variant="caption" color={colors.inkMuted}>
            {subscription.status === 'expired'
              ? 'Renew to create and edit. Your records are safe and readable.'
              : `${subscription.planName} · everything in one place`}
          </AppText>
        </View>
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
              { label: 'Customers', value: stats.customers },
              { label: 'Active jobs', value: stats.active },
              { label: 'Due this week', value: stats.dueThisWeek },
              { label: 'Completed this month', value: stats.completedThisMonth },
            ].map((item) => (
              <Card key={item.label} style={styles.statCard}>
                <AppText variant="h1" weight="bold" tabular>
                  {item.value}
                </AppText>
                <AppText variant="caption" color={colors.inkMuted}>
                  {item.label}
                </AppText>
              </Card>
            ))}
          </View>

          <View style={styles.section}>
            <AppText variant="h3">Deliveries this week</AppText>
            {deliveries.length === 0 ? (
              <Card>
                <AppText variant="body" color={colors.inkMuted}>
                  Nothing due in the next seven days.
                </AppText>
              </Card>
            ) : (
              deliveries.map((item) => (
                <Card key={item.id} style={styles.dueCard} accent={item.daysUntil < 0 ? 'danger' : undefined}>
                  <View style={styles.dueCopy}>
                    <AppText variant="label">{item.projectName ?? item.customerName}</AppText>
                    <AppText variant="caption" color={colors.inkMuted}>
                      {item.customerName}
                    </AppText>
                    <AppText variant="caption" color={item.daysUntil < 0 ? colors.danger : colors.inkMuted}>
                      {dueLabel(item.daysUntil)}
                    </AppText>
                  </View>
                  {item.daysUntil < 0 ? <StatusPill status="overdue" /> : null}
                </Card>
              ))
            )}
          </View>

          {celebrations.length > 0 ? (
            <View style={styles.section}>
              <AppText variant="h3">Celebrations</AppText>
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
              <AppText variant="h3">Recent customers</AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.customerStrip}>
                {customers.slice(0, 6).map((customer) => (
                  <View key={customer.id} style={styles.customerChip}>
                    <Avatar name={customer.fullName} uri={customer.photoUrl} size="lg" />
                    <AppText variant="caption" center numberOfLines={2}>
                      {customer.fullName.split(' ')[0]}
                    </AppText>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <AppText variant="label">Your book is ready</AppText>
              <AppText variant="body" color={colors.inkMuted}>
                Add your first customer to start saving measurements. Customer screens arrive in Phase 4 — you will add
                them right here.
              </AppText>
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
  banner: {
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xxs,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.ambient,
  },
  bannerWarning: { backgroundColor: colors.warningSoft, borderColor: colors.warningSoft },
  bannerSuccess: { backgroundColor: colors.successSoft, borderColor: colors.successSoft },
  bannerDanger: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft },
  loadingCard: { minHeight: 96, justifyContent: 'center' },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: {
    width: '48%',
    flexGrow: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.xxs,
  },
  section: { gap: spacing.sm },
  dueCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  dueCopy: { flex: 1, gap: spacing.xxs },
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


