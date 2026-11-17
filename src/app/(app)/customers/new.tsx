import { Stack, useRouter } from 'expo-router';
import { Fragment } from 'react';

import { useToast } from '@/components/ui/Toast';
import { repositoryErrorCopy, toRepositoryError } from '@/data';
import { CustomerForm } from '@/features/customers/CustomerForm';
import { useCreateCustomer } from '@/features/customers/queries';
import { toNewCustomer } from '@/features/customers/validation';

/**
 * Screen 19 — same form as edit, opened as a modal (create flows are modals,
 * never tabs). Saving goes straight to the new profile.
 */
export default function NewCustomerScreen() {
  const router = useRouter();
  const toast = useToast();
  const create = useCreateCustomer();

  return (
    <Fragment>
      <Stack.Screen options={{ presentation: 'modal' }} />
      <CustomerForm
        title="New customer"
        subtitle="Name and phone are all you need. Measurements come next."
        submitLabel="Save customer"
        busy={create.isPending}
        onClose={() => router.back()}
        onSubmit={(values) => {
          create.mutate(toNewCustomer(values), {
            onSuccess: (customer) => {
              toast.show({ message: `${customer.fullName.split(' ')[0]} added to your book`, tone: 'success' });
              router.replace(`/customers/${customer.id}` as never);
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
      />
    </Fragment>
  );
}
