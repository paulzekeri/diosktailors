import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { repo, type Customer } from '@/data';
import { formatPhoneDisplay } from '@/lib/phone';
import { colors, layout, spacing } from '@/theme';

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        const list = await repo.customers.list();
        if (!active) return;
        setCustomers(list);
        setLoading(false);
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <Screen contentStyle={styles.content} bottomPadding={spacing.xxl + layout.tabBarHeight}>
      <View style={styles.header}>
        <AppText variant="h1">Customers</AppText>
        <AppText variant="body" color={colors.inkMuted}>
          {loading
            ? 'Loading…'
            : customers.length === 0
              ? 'No customers yet'
              : `${customers.length} ${customers.length === 1 ? 'customer' : 'customers'} · sorted A–Z`}
        </AppText>
      </View>

      <Card style={styles.note}>
        <AppText variant="label">Read-only preview</AppText>
        <AppText variant="caption" color={colors.inkMuted}>
          Adding, editing, searching and measuring customers arrives in Phase 4. The list below is already reading from
          the same repository it will use.
        </AppText>
      </Card>

      {!loading && customers.length === 0 ? (
        <Card>
          <AppText variant="body" color={colors.inkMuted}>
            Your customers will appear here. Add the first one in Phase 4.
          </AppText>
        </Card>
      ) : (
        <View style={styles.list}>
          {customers.map((customer) => (
            <Card key={customer.id} style={styles.row}>
              <Avatar name={customer.fullName} uri={customer.photoUrl} size="md" />
              <View style={styles.rowCopy}>
                <AppText variant="label">{customer.fullName}</AppText>
                <AppText variant="caption" color={colors.inkMuted}>
                  {formatPhoneDisplay(customer.whatsappE164 ?? customer.phoneE164)}
                </AppText>
              </View>
              {customer.birthday ? (
                <AppText variant="caption" color={colors.inkSubtle}>
                  🎂
                </AppText>
              ) : null}
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.lg, gap: spacing.lg },
  header: { gap: spacing.xxs },
  note: { backgroundColor: colors.surfaceMuted, gap: spacing.xxs },
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: layout.rowHeight - 8 },
  rowCopy: { flex: 1, gap: spacing.xxs },
});
