import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { useToast } from '@/components/ui/Toast';
import { Wash } from '@/components/ui/Wash';
import { repositoryErrorCopy, toRepositoryError } from '@/data';
import { useCustomer } from '@/features/customers/queries';
import { useCurrentMeasurement } from '@/features/measurements/queries';
import { useProject, useSetProjectStatus } from '@/features/projects/queries';
import { actionsFor, daysLate, isClosed, isOverdue, pillStatus, type StatusAction } from '@/features/projects/status';
import { daysUntil, dueLabel, formatLongDate } from '@/lib/date';
import { formatPhoneDisplay, whatsappUrl } from '@/lib/phone';
import { colors, layout, radius, spacing } from '@/theme';

/**
 * Screens 26 + 28 (§5): project detail with the status machine as its primary
 * action. Only legal moves are rendered; `Delivered` and `Archive` each need a
 * confirmation that spells out the consequence.
 */
export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const project = useProject(id);
  const customer = useCustomer(project.data?.customerId);
  const measurement = useCurrentMeasurement(project.data?.customerId);
  const setStatus = useSetProjectStatus();

  const [pending, setPending] = useState<StatusAction | null>(null);

  const late = project.data ? isOverdue(project.data) : false;
  const error = project.isError ? repositoryErrorCopy[toRepositoryError(project.error).code] : null;

  function runAction(action: StatusAction) {
    const projectId = project.data?.id;
    if (!projectId) return;
    setPending(null);

    setStatus.mutate(
      { id: projectId, status: action.to },
      {
        onSuccess: () => {
          const delivered = action.to === 'delivered';
          toast.show({
            message: action.toast,
            tone: delivered ? 'success' : 'default',
            actionLabel: delivered ? 'Archive' : undefined,
            onAction: delivered ? () => setPending(actionsFor('delivered')[0]) : undefined,
          });
        },
        onError: (caught) => {
          toast.show({
            message: repositoryErrorCopy[toRepositoryError(caught).code],
            tone: 'danger',
            duration: 6000,
          });
        },
      },
    );
  }

  function tapAction(action: StatusAction) {
    if (action.confirm) setPending(action);
    else runAction(action);
  }

  const actions = project.data ? actionsFor(project.data.status) : [];
  const primary = actions.find((action) => !action.secondary);
  const secondary = actions.filter((action) => action.secondary);

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
          accessibilityLabel="Back to projects"
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.back}
        >
          <AppText variant="label" weight="semiBold" color={colors.primary}>
            ← Projects
          </AppText>
        </Pressable>

        {project.isLoading ? (
          <View style={styles.loading}>
            <Skeleton width="70%" height={28} />
            <SkeletonText lines={2} />
            <Skeleton height={84} />
          </View>
        ) : error || !project.data ? (
          <EmptyState
            tone="error"
            title="Project unavailable"
            description={error ?? repositoryErrorCopy.not_found}
            actionLabel="Try again"
            onAction={() => void project.refetch()}
          />
        ) : (
          <>
            <View style={styles.titleRow}>
              <View style={styles.titleCopy}>
                <AppText variant="h1">{project.data.name}</AppText>
                <AppText variant="body" color={colors.inkMuted}>
                  {customer.data?.fullName ?? 'Customer'} · received {formatLongDate(project.data.orderReceivedAt)}
                </AppText>
              </View>
              <StatusPill status={pillStatus(project.data)} />
            </View>

            <Card style={styles.dateCard} accent={late ? 'danger' : undefined} texture>
              <AppText variant="caption" color={colors.inkMuted}>
                Expected delivery
              </AppText>
              <AppText variant="label" weight="semiBold">
                {formatLongDate(project.data.expectedDeliveryAt)}
              </AppText>
              <AppText variant="caption" color={late ? colors.danger : colors.inkMuted}>
                {isClosed(project.data.status)
                  ? project.data.collectedAt
                    ? `Collected ${formatLongDate(project.data.collectedAt)}`
                    : `Closed ${formatLongDate(project.data.expectedDeliveryAt)}`
                  : late
                    ? `${daysLate(project.data)} ${daysLate(project.data) === 1 ? 'day late' : 'days late'}`
                    : dueLabel(daysUntil(project.data.expectedDeliveryAt))}
              </AppText>
            </Card>

            {customer.data ? (
              <Card style={styles.customerRow}>
                <Avatar name={customer.data.fullName} uri={customer.data.photoUrl} size="md" />
                <View style={styles.customerCopy}>
                  <AppText variant="label" numberOfLines={1}>
                    {customer.data.fullName}
                  </AppText>
                  <AppText variant="caption" color={colors.inkMuted}>
                    {formatPhoneDisplay(customer.data.phoneE164)}
                  </AppText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`WhatsApp ${customer.data.fullName}`}
                  onPress={() => {
                    const url = whatsappUrl(
                      customer.data?.whatsappE164 ?? customer.data?.phoneE164,
                      `Hello ${customer.data?.fullName.split(' ')[0] ?? ''}, about ${project.data?.name ?? 'your job'}…`,
                    );
                    if (url) void Linking.openURL(url);
                  }}
                  style={styles.whatsapp}
                >
                  <AppText variant="caption" weight="semiBold" color={colors.white}>
                    WhatsApp
                  </AppText>
                </Pressable>
              </Card>
            ) : null}

            <Card style={styles.measureCard}>
              <View style={styles.measureCopy}>
                <AppText variant="caption" color={colors.inkMuted}>
                  Measurements
                </AppText>
                <AppText variant="label" weight="semiBold">
                  {measurement.data ? `Version ${measurement.data.version} · ${measurement.data.unit === 'inches' ? 'inches' : 'cm'}` : 'None recorded yet'}
                </AppText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open the customer's measurements"
                onPress={() => router.push(`/customers/${project.data?.customerId}` as never)}
                hitSlop={8}
              >
                <AppText variant="caption" weight="semiBold" color={colors.primary}>
                  {measurement.data ? 'View' : 'Measure'}
                </AppText>
              </Pressable>
            </Card>

            {project.data.description ? (
              <Card style={styles.noteCard}>
                <AppText variant="caption" color={colors.inkMuted}>
                  Description
                </AppText>
                <AppText variant="body">{project.data.description}</AppText>
              </Card>
            ) : null}

            {project.data.instructions ? (
              <Card style={styles.noteCard}>
                <AppText variant="caption" color={colors.inkMuted}>
                  Instructions
                </AppText>
                <AppText variant="body">{project.data.instructions}</AppText>
              </Card>
            ) : null}

            {project.data.notes ? (
              <Card style={styles.noteCard} tone="muted">
                <AppText variant="caption" color={colors.inkMuted}>
                  Notes
                </AppText>
                <AppText variant="body">{project.data.notes}</AppText>
              </Card>
            ) : null}

            {project.data.status === 'archived' ? (
              <Card style={styles.noteCard} tone="muted">
                <AppText variant="label">Archived</AppText>
                <AppText variant="caption" color={colors.inkMuted}>
                  Finished and filed. Measurements, photos and history stay attached to the customer.
                </AppText>
              </Card>
            ) : null}

            {actions.length > 0 ? (
              <View style={styles.actions}>
                {primary ? (
                  <Button
                    label={primary.label}
                    variant={primary.destructive ? 'danger' : 'primary'}
                    loading={setStatus.isPending}
                    onPress={() => tapAction(primary)}
                  />
                ) : null}
                {secondary.map((action) => (
                  <Button
                    key={action.label}
                    label={action.label}
                    variant="secondary"
                    disabled={setStatus.isPending}
                    onPress={() => tapAction(action)}
                  />
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={pending !== null}
        title={pending?.confirm?.title ?? ''}
        message={pending?.confirm?.message ?? ''}
        confirmLabel={pending?.confirm?.confirmLabel ?? 'Confirm'}
        destructive={pending?.confirm?.destructive}
        loading={setStatus.isPending}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) runAction(pending);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: layout.gutter, gap: spacing.lg },
  back: { minHeight: layout.touchTarget, justifyContent: 'center', alignSelf: 'flex-start' },
  loading: { gap: spacing.lg },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  titleCopy: { flex: 1, gap: spacing.xxs },
  dateCard: { gap: spacing.xxs },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  customerCopy: { flex: 1, gap: spacing.xxs },
  whatsapp: {
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.whatsappDeep,
  },
  measureCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  measureCopy: { flex: 1, gap: spacing.xxs },
  noteCard: { gap: spacing.xxs },
  actions: { gap: spacing.sm, paddingBottom: spacing.lg },
});
