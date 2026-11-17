import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Wash } from '@/components/ui/Wash';
import { repositoryErrorCopy, toRepositoryError } from '@/data';
import { CustomerForm } from '@/features/customers/CustomerForm';
import { useCustomer, useDeleteCustomer, useUpdateCustomer } from '@/features/customers/queries';
import { toFormValues, toNewCustomer } from '@/features/customers/validation';
import { colors, layout, radius, spacing } from '@/theme';

/**
 * Screen 21 — prefilled edit form. Delete is a soft delete behind a second,
 * explicit confirmation; measurements and projects are never touched.
 */
export default function EditCustomerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const customer = useCustomer(id);
  const update = useUpdateCustomer(id ?? '');
  const remove = useDeleteCustomer();
  const [confirming, setConfirming] = useState(false);

  const initialValues = useMemo(() => (customer.data ? toFormValues(customer.data) : null), [customer.data]);

  if (customer.isLoading) {
    return (
      <View style={[styles.page, { paddingTop: insets.top + spacing.xl, paddingHorizontal: layout.gutter }]}>
        <Stack.Screen options={{ animation: 'slide_from_right' }} />
        <Wash variant="screen" />
        <Skeleton width="60%" height={28} />
        <View style={styles.loading}>
          <Skeleton height={52} />
          <Skeleton height={52} />
          <SkeletonText lines={2} />
        </View>
      </View>
    );
  }

  if (!customer.data || !initialValues) {
    return (
      <View style={[styles.page, { paddingTop: insets.top + spacing.xl, paddingHorizontal: layout.gutter }]}>
        <Stack.Screen options={{ animation: 'slide_from_right' }} />
        <Wash variant="screen" />
        <EmptyState
          tone="error"
          title="Customer unavailable"
          description={repositoryErrorCopy[toRepositoryError(customer.error).code]}
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const firstName = customer.data.fullName.split(' ')[0];

  return (
    <Fragment>
      <Stack.Screen options={{ animation: 'slide_from_right' }} />
      <CustomerForm
        title="Edit customer"
        subtitle="Changes update the profile only — measurement history is never touched."
        submitLabel="Save changes"
        initialValues={initialValues}
        busy={update.isPending}
        excludeCustomerId={customer.data.id}
        onClose={() => router.back()}
        onSubmit={(values) => {
          update.mutate(toNewCustomer(values), {
            onSuccess: () => {
              toast.show({ message: 'Customer updated', tone: 'success' });
              router.back();
            },
            onError: (error) => {
              toast.show({
                message: repositoryErrorCopy[toRepositoryError(error).code],
                tone: 'danger',
                duration: 6000,
              });
            },
          });
        }}
      >
        <View style={styles.danger}>
          <AppText variant="label" color={colors.danger}>
            Delete this customer
          </AppText>
          <AppText variant="caption" color={colors.inkMuted}>
            {firstName} disappears from your list and new jobs. Measurements and projects are kept, and you can restore
            them from Recently deleted.
          </AppText>
          <Button label="Delete customer" variant="danger" onPress={() => setConfirming(true)} />
        </View>
      </CustomerForm>

      <ConfirmDialog
        visible={confirming}
        title={`Delete ${customer.data.fullName}?`}
        message="The customer leaves your list. Their measurements and projects are kept — restore them any time from Recently deleted."
        confirmLabel="Delete customer"
        destructive
        loading={remove.isPending}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          if (!id) return;
          remove.mutate(id, {
            onSuccess: () => {
              setConfirming(false);
              toast.show({ message: `${firstName} moved to Recently deleted`, tone: 'success' });
              router.replace('/customers' as never);
            },
            onError: (error) => {
              setConfirming(false);
              toast.show({
                message: repositoryErrorCopy[toRepositoryError(error).code],
                tone: 'danger',
                duration: 6000,
              });
            },
          });
        }}
      />
    </Fragment>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas, gap: spacing.lg },
  loading: { gap: spacing.md, marginTop: spacing.lg },
  danger: {
    gap: spacing.sm,
    padding: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.dangerSoft,
    backgroundColor: colors.dangerSoft,
  },
});
