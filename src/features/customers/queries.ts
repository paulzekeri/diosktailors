/**
 * Customer data hooks — screen → hook → repository.
 * Screens must never import `repo` directly; they read cache from these hooks
 * and mutate through these mutations so every list stays in sync.
 */
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { repo, RepositoryError, type Customer, type NewCustomer } from '@/data';
import { customerKeys, projectKeys } from '@/data/queryKeys';

function invalidateCustomers(client: QueryClient) {
  void client.invalidateQueries({ queryKey: customerKeys.all });
  void client.invalidateQueries({ queryKey: projectKeys.all });
}

/** Debounce the argument with `useDebouncedValue` before calling this. */
export function useCustomers(query = '') {
  const term = query.trim();
  return useQuery({
    queryKey: customerKeys.list(term),
    queryFn: () => repo.customers.list(term || undefined),
    placeholderData: (previous: Customer[] | undefined) => previous,
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: customerKeys.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: () => {
      if (!id) throw new RepositoryError('not_found');
      return repo.customers.get(id);
    },
  });
}

export function useDeletedCustomers() {
  return useQuery({ queryKey: customerKeys.deleted(), queryFn: () => repo.customers.listDeleted() });
}

export function useCreateCustomer() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: NewCustomer) => repo.customers.create(input),
    onSuccess: () => invalidateCustomers(client),
  });
}

export function useUpdateCustomer(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Customer>) => repo.customers.update(id, patch),
    onSuccess: (customer) => {
      client.setQueryData(customerKeys.detail(id), customer);
      invalidateCustomers(client);
    },
  });
}

export function useDeleteCustomer() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repo.customers.softDelete(id),
    onSuccess: () => invalidateCustomers(client),
  });
}

export function useRestoreCustomer() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repo.customers.restore(id),
    onSuccess: () => invalidateCustomers(client),
  });
}

/** The Projects segment of the customer profile. */
export function useCustomerProjects(customerId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.byCustomer(customerId ?? ''),
    enabled: Boolean(customerId),
    queryFn: () => {
      if (!customerId) throw new RepositoryError('not_found');
      return repo.projects.byCustomer(customerId);
    },
  });
}
