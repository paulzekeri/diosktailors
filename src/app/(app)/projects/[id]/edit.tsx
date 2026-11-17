import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { useToast } from '@/components/ui/Toast';
import { Wash } from '@/components/ui/Wash';
import { repositoryErrorCopy, toRepositoryError } from '@/data';
import { useCustomer } from '@/features/customers/queries';
import { useCurrentMeasurement } from '@/features/measurements/queries';
import { ProjectForm } from '@/features/projects/ProjectForm';
import { useProject, useUpdateProject } from '@/features/projects/queries';
import { toProjectFormValues } from '@/features/projects/validation';
import { colors, layout, spacing } from '@/theme';

/**
 * Screen 27 (§5): edit a job. The customer can never change, and retiring a job
 * stays in one place — the status machine on the project screen — so there is no
 * second, competing "delete" path.
 */
export default function EditProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const project = useProject(id);
  const customer = useCustomer(project.data?.customerId);
  const measurement = useCurrentMeasurement(project.data?.customerId);
  const update = useUpdateProject(id ?? '');

  if (project.isLoading) {
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

  if (!project.data) {
    return (
      <View style={[styles.page, { paddingTop: insets.top + spacing.xl, paddingHorizontal: layout.gutter }]}>
        <Stack.Screen options={{ animation: 'slide_from_right' }} />
        <Wash variant="screen" />
        <EmptyState
          tone="error"
          title="Project unavailable"
          description={repositoryErrorCopy[toRepositoryError(project.error).code]}
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  return (
    <Fragment>
      <Stack.Screen options={{ animation: 'slide_from_right' }} />
      <ProjectForm
        title="Edit job"
        subtitle={`${customer.data?.fullName ?? 'Customer'} · status stays ${project.data.status.replace('_', ' ')}`}
        submitLabel="Save changes"
        initialValues={toProjectFormValues(project.data)}
        busy={update.isPending}
        onClose={() => router.back()}
        aboveFields={
          <Card style={styles.summary}>
            <View style={styles.summaryCopy}>
              <AppText variant="caption" color={colors.inkMuted}>
                {customer.data?.fullName ?? 'Customer'}
              </AppText>
              <AppText variant="label" weight="semiBold">
                {measurement.data
                  ? `Measurements v${measurement.data.version} · ${measurement.data.unit === 'inches' ? 'inches' : 'cm'}`
                  : 'No measurements linked'}
              </AppText>
            </View>
            <StatusPill status={project.data.status} />
          </Card>
        }
        onSubmit={(values) => {
          update.mutate(
            {
              name: values.name,
              expectedDeliveryAt: values.expectedDeliveryAt,
              description: values.description || undefined,
              instructions: values.instructions || undefined,
              notes: values.notes || undefined,
            },
            {
              onSuccess: () => {
                toast.show({ message: 'Job updated', tone: 'success' });
                router.back();
              },
              onError: (error) => {
                toast.show({
                  message: repositoryErrorCopy[toRepositoryError(error).code],
                  tone: 'danger',
                  duration: 6000,
                });
              },
            },
          );
        }}
      >
        <Card style={styles.note} tone="muted">
          <AppText variant="caption" color={colors.inkMuted}>
            To retire a job, mark it delivered and then archive it on the project screen — that keeps every status change
            in one place.
          </AppText>
        </Card>
      </ProjectForm>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas, gap: spacing.lg },
  loading: { gap: spacing.md, marginTop: spacing.lg },
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  summaryCopy: { flex: 1, gap: spacing.xxs },
  note: { gap: spacing.xxs },
});
