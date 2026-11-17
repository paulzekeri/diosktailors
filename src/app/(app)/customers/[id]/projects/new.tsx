import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Fragment, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { goBack } from '@/lib/navigation';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { repositoryErrorCopy, toRepositoryError } from '@/data';
import { useCustomer } from '@/features/customers/queries';
import { useCurrentMeasurement } from '@/features/measurements/queries';
import { ProjectForm } from '@/features/projects/ProjectForm';
import { useCreateProject } from '@/features/projects/queries';
import { EMPTY_PROJECT_FORM, toNewProject } from '@/features/projects/validation';
import { addDaysISO, formatLongDate } from '@/lib/date';
import { colors, layout, radius, spacing } from '@/theme';

/**
 * Screen 25 (§5): new job for a customer. Defaults to `pending` and two weeks
 * out, links the current measurement version, and lands on the detail so the
 * status flow can start immediately.
 */
export default function NewProjectScreen() {
  const { id: customerId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const customer = useCustomer(customerId);
  const measurement = useCurrentMeasurement(customerId);
  const create = useCreateProject();
  const [linkMeasurement, setLinkMeasurement] = useState(true);

  const linkedVersion = measurement.data
    ? `Version ${measurement.data.version} · ${measurement.data.unit === 'inches' ? 'inches' : 'cm'}`
    : 'None recorded yet';

  return (
    <Fragment>
      <Stack.Screen options={{ presentation: 'modal' }} />
      <ProjectForm
        title="New job"
        subtitle={`${customer.data ? `For ${customer.data.fullName}` : 'For this customer'} · starts pending, due in two weeks`}
        submitLabel="Save job"
        initialValues={{ ...EMPTY_PROJECT_FORM, expectedDeliveryAt: addDaysISO(14) }}
        busy={create.isPending}
        onClose={() => goBack(router, `/customers/${customerId}`)}
        aboveFields={
          <Card style={styles.measureCard} tone={linkMeasurement && measurement.data ? 'brand' : 'default'}>
            <View style={styles.measureCopy}>
              <AppText variant="caption" color={colors.inkMuted}>
                Measurements
              </AppText>
              <AppText variant="label" weight="semiBold">
                {linkedVersion}
              </AppText>
            </View>
            {measurement.data ? (
              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: linkMeasurement }}
                accessibilityLabel="Link this measurement to the job"
                onPress={() => setLinkMeasurement((previous) => !previous)}
                style={[styles.linkToggle, linkMeasurement && styles.linkToggleOn]}
              >
                <AppText variant="caption" weight="semiBold" color={linkMeasurement ? colors.canvas : colors.inkMuted}>
                  {linkMeasurement ? 'Linked' : 'Link'}
                </AppText>
              </Pressable>
            ) : (
              <AppText variant="caption" color={colors.inkSubtle}>
                Measure first
              </AppText>
            )}
          </Card>
        }
        onSubmit={(values) => {
          if (!customerId) return;
          const linked = linkMeasurement ? measurement.data?.id : undefined;

          create.mutate(toNewProject(customerId, values, linked) as never, {
            onSuccess: (project) => {
              toast.show({
                message: `${project.name} created · due ${formatLongDate(project.expectedDeliveryAt)}`,
                tone: 'success',
              });
              router.replace(`/projects/${project.id}` as never);
            },
            onError: (error) => {
              toast.show({ message: repositoryErrorCopy[toRepositoryError(error).code], tone: 'danger', duration: 6000 });
            },
          });
        }}
      />
    </Fragment>
  );
}

const styles = StyleSheet.create({
  measureCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  measureCopy: { flex: 1, gap: spacing.xxs },
  linkToggle: {
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  linkToggleOn: { backgroundColor: colors.primary, borderColor: colors.primary },
});
