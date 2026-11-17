import { Stack, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Wash } from '@/components/ui/Wash';
import { repositoryErrorCopy, toRepositoryError } from '@/data';
import { useDeletedCustomers, useRestoreCustomer } from '@/features/customers/queries';
import { formatShortDate } from '@/lib/date';
import { formatPhoneDisplay } from '@/lib/phone';
import { colors, layout, spacing } from '@/theme';

/**
 * Recently deleted (the restore half of the soft-delete gate). Deleted
 * customers keep their measurements and projects; restoring puts the row back
 * exactly where it was.
 */
export default function DeletedCustomersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const deleted = useDeletedCustomers();
  const restore = useRestoreCustomer();

  return (
    <View style={styles.page}>
      <Stack.Screen options={{ animation: 'slide_from_right' }} />
      <Wash variant="screen" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to customers"
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.back}
        >
          <AppText variant="label" weight="semiBold" color={colors.primary}>
            ← Customers
          </AppText>
        </Pressable>

        <View style={styles.header}>
          <AppText variant="h1">Recently deleted</AppText>
          <AppText variant="body" color={colors.inkMuted}>
            Measurements and projects are kept while a customer sits here.
          </AppText>
        </View>

        {deleted.isLoading ? (
          <SkeletonList rows={3} />
        ) : deleted.isError ? (
          <EmptyState
            tone="error"
            title="Could not load deleted customers"
            description={repositoryErrorCopy[toRepositoryError(deleted.error).code]}
            actionLabel="Try again"
            onAction={() => void deleted.refetch()}
          />
        ) : (deleted.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="Nothing deleted"
            description="Customers you delete appear here, with their measurements and projects intact."
          />
        ) : (
          <View style={styles.list}>
            {deleted.data?.map((customer) => (
              <Card key={customer.id} style={styles.row}>
                <Avatar name={customer.fullName} uri={customer.photoUrl} size="md" />
                <View style={styles.copy}>
                  <AppText variant="label" numberOfLines={1}>
                    {customer.fullName}
                  </AppText>
                  <AppText variant="caption" color={colors.inkMuted} numberOfLines={1}>
                    {formatPhoneDisplay(customer.phoneE164)}
                    {customer.deletedAt ? ` · deleted ${formatShortDate(customer.deletedAt)}` : ''}
                  </AppText>
                </View>
                <Button
                  label="Restore"
                  variant="secondary"
                  fullWidth={false}
                  loading={restore.isPending && restore.variables === customer.id}
                  onPress={() =>
                    restore.mutate(customer.id, {
                      onSuccess: () =>
                        toast.show({ message: `${customer.fullName.split(' ')[0]} restored`, tone: 'success' }),
                      onError: (error) =>
                        toast.show({
                          message: repositoryErrorCopy[toRepositoryError(error).code],
                          tone: 'danger',
                          duration: 6000,
                        }),
                    })
                  }
                />
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: layout.gutter, gap: spacing.lg },
  back: { minHeight: layout.touchTarget, justifyContent: 'center', alignSelf: 'flex-start' },
  header: { gap: spacing.xxs },
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: layout.rowHeight },
  copy: { flex: 1, gap: spacing.xxs },
});
