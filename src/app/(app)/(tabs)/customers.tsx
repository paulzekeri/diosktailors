import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchField } from '@/components/ui/SearchField';
import { SkeletonList } from '@/components/ui/Skeleton';
import { Wash } from '@/components/ui/Wash';
import { CustomersIcon } from '@/components/ui/icons';
import { repositoryErrorCopy, toRepositoryError, type Customer } from '@/data';
import { activeJobCounts, activeJobLabel, customerCountLabel, sectionByInitial } from '@/features/customers/list';
import { useCustomers } from '@/features/customers/queries';
import { useProjects } from '@/features/projects/queries';
import { formatPhoneDisplay } from '@/lib/phone';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { colors, layout, radius, spacing } from '@/theme';

/**
 * Screen 15 (§5): search, A–Z sections, 72px rows, active-job counts, and all
 * four states. A SectionList rather than a ScrollView so 500+ customers stay
 * virtualised — sticky letter headers come for free.
 */
export default function CustomersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [term, setTerm] = useState('');
  const debouncedTerm = useDebouncedValue(term, 250);

  const customers = useCustomers(debouncedTerm);
  const projects = useProjects('all');

  const counts = useMemo(() => activeJobCounts(projects.data ?? []), [projects.data]);
  const sections = useMemo(() => sectionByInitial(customers.data ?? []), [customers.data]);

  const rows = customers.data ?? [];
  const searching = debouncedTerm.trim().length > 0;

  function addCustomer() {
    router.push('/customers/new' as never);
  }

  const header = (
    <View style={styles.header}>
      <View style={styles.titleCopy}>
        <AppText variant="h1">Customers</AppText>
        <AppText variant="body" color={colors.inkMuted}>
          {customers.isLoading ? 'Loading…' : customerCountLabel(rows.length, debouncedTerm)}
        </AppText>
      </View>

      <SearchField
        value={term}
        onChangeText={setTerm}
        placeholder="Search name or phone"
        accessibilityLabel="Search customers by name or phone"
      />

      <Button label="Add customer" onPress={addCustomer} />
    </View>
  );

  const empty = customers.isLoading ? (
    <SkeletonList rows={5} />
  ) : customers.isError ? (
    <EmptyState
      tone="error"
      icon={<CustomersIcon size={26} color={colors.danger} />}
      title="Could not load customers"
      description={repositoryErrorCopy[toRepositoryError(customers.error).code]}
      actionLabel="Try again"
      onAction={() => void customers.refetch()}
    />
  ) : searching ? (
    <EmptyState
      icon={<CustomersIcon size={26} color={colors.primary} />}
      title="No matches"
      description={`Nothing in your book matches “${debouncedTerm.trim()}”. Try a different name or number.`}
      actionLabel="Add as a customer"
      onAction={addCustomer}
    />
  ) : (
    <EmptyState
      icon={<CustomersIcon size={26} color={colors.primary} />}
      title="Your book is empty"
      description="Add your first customer — their measurements stay on file forever."
      actionLabel="Add customer"
      onAction={addCustomer}
    />
  );


  return (
    <View style={styles.page}>
      <Wash variant="screen" />
      <SectionList<Customer, { title: string; data: Customer[] }>
        sections={sections}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        ListEmptyComponent={<View style={styles.empty}>{empty}</View>}
        ListFooterComponent={
          customers.isRefetching && !customers.isLoading ? (
            <AppText variant="caption" color={colors.inkSubtle} center style={styles.refreshing}>
              Updating…
            </AppText>
          ) : undefined
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <AppText variant="micro" color={colors.inkSubtle}>
              {section.title}
            </AppText>
          </View>
        )}
        renderItem={({ item }) => {
          const badge = activeJobLabel(counts[item.id] ?? 0);
          return (
            <Card
              style={styles.row}
              onPress={() => router.push(`/customers/${item.id}` as never)}
              accessibilityLabel={`Open ${item.fullName}`}
            >
              <Avatar name={item.fullName} uri={item.photoUrl} size="md" />
              <View style={styles.rowCopy}>
                <AppText variant="label" numberOfLines={1}>
                  {item.fullName}
                </AppText>
                <AppText variant="caption" color={colors.inkMuted} numberOfLines={1}>
                  {formatPhoneDisplay(item.phoneE164)}
                </AppText>
              </View>
              {badge ? (
                <View style={styles.badge}>
                  <AppText variant="caption" weight="semiBold" color={colors.primary}>
                    {badge}
                  </AppText>
                </View>
              ) : null}
            </Card>
          );
        }}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: spacing.xxl + layout.tabBarHeight + insets.bottom,
          },
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: layout.gutter },
  header: { gap: spacing.md, paddingBottom: spacing.lg },
  titleCopy: { gap: spacing.xxs },
  sectionHeader: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    backgroundColor: colors.canvas,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: layout.rowHeight,
    paddingVertical: spacing.md,
  },
  rowCopy: { flex: 1, gap: spacing.xxs },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.primaryTint,
  },
  separator: { height: spacing.sm },
  empty: { paddingTop: spacing.xl },
  refreshing: { paddingTop: spacing.lg },
});
