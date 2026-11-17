import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { Wash } from '@/components/ui/Wash';
import { repositoryErrorCopy, toRepositoryError } from '@/data';
import { useCustomer, useCustomerProjects } from '@/features/customers/queries';
import { useMeasurementVersions, useTemplates } from '@/features/measurements/queries';
import { formatLongDate, formatShortDate } from '@/lib/date';
import { formatPhoneDisplay, whatsappUrl } from '@/lib/phone';
import { formatMeasurement } from '@/lib/units';
import { colors, layout, radius, spacing } from '@/theme';

type Segment = 'measurements' | 'projects' | 'details';

/**
 * Screen 20 (§5): profile with contact actions and the Measurements / Projects /
 * Details segments. Read-only this slice — edit and measurement entry land next,
 * so no action is rendered before its route exists (no dead ends).
 */
export default function CustomerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [segment, setSegment] = useState<Segment>('measurements');

  const customer = useCustomer(id);
  const projects = useCustomerProjects(id);
  const versions = useMeasurementVersions(id);
  const templates = useTemplates();

  const fieldsById = useMemo(() => {
    const template = templates.data?.[0];
    const map = new Map<string, string>();
    template?.fields.forEach((field) => map.set(field.id, field.label));
    return map;
  }, [templates.data]);

  const current = versions.data?.find((version) => version.isCurrent) ?? versions.data?.[0];
  const whatsapp = customer.data?.whatsappE164 ?? customer.data?.phoneE164;

  /** Template order, so a saved version always reads neck → shoulder → bust … */
  const orderedFields = useMemo(() => {
    const template = templates.data?.[0];
    if (template) return template.fields.map((field) => ({ id: field.id, label: field.label }));
    return Object.keys(current?.data ?? {}).map((id) => ({ id, label: fieldsById.get(id) ?? id }));
  }, [templates.data, current, fieldsById]);


  const error = customer.isError ? repositoryErrorCopy[toRepositoryError(customer.error).code] : null;

  function openWhatsApp() {
    const url = whatsappUrl(whatsapp, `Hello ${customer.data?.fullName.split(' ')[0] ?? ''}!`);
    if (url) void Linking.openURL(url);
  }

  function call() {
    const phone = customer.data?.phoneE164;
    if (phone) void Linking.openURL(`tel:${phone}`);
  }

  return (
    <View style={styles.page}>
      <Stack.Screen options={{ animation: 'slide_from_right' }} />
      <Wash variant="screen" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl + layout.tabBarHeight + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit ${customer.data?.fullName ?? 'customer'}`}
            onPress={() => router.push(`/customers/${id}/edit` as never)}
            hitSlop={10}
            style={styles.back}
          >
            <AppText variant="label" weight="semiBold" color={colors.primary}>
              Edit
            </AppText>
          </Pressable>
        </View>

        {customer.isLoading ? (
          <View style={styles.loading}>
            <Skeleton width={96} height={96} round={radius.full} />
            <SkeletonText lines={2} />
          </View>
        ) : error || !customer.data ? (
          <EmptyState
            tone="error"
            title="Customer unavailable"
            description={error ?? repositoryErrorCopy.not_found}
            actionLabel="Try again"
            onAction={() => void customer.refetch()}
          />
        ) : (
          <>
            <View style={styles.identity}>
              <Avatar name={customer.data.fullName} uri={customer.data.photoUrl} size="xl" />
              <View style={styles.identityCopy}>
                <AppText variant="h1" numberOfLines={2}>
                  {customer.data.fullName}
                </AppText>
                <AppText variant="body" color={colors.inkMuted}>
                  {formatPhoneDisplay(customer.data.phoneE164)}
                </AppText>
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`WhatsApp ${customer.data.fullName}`}
                onPress={openWhatsApp}
                style={[styles.action, styles.actionPrimary]}
              >
                <AppText variant="label" weight="semiBold" color={colors.white}>
                  WhatsApp
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Call ${customer.data.fullName}`}
                onPress={call}
                style={[styles.action, styles.actionSecondary]}
              >
                <AppText variant="label" weight="semiBold" color={colors.ink}>
                  Call
                </AppText>
              </Pressable>
            </View>

            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`New job for ${customer.data.fullName}`}
                onPress={() => router.push(`/customers/${id}/projects/new` as never)}
                style={[styles.action, styles.actionSecondary]}
              >
                <AppText variant="label" weight="semiBold" color={colors.ink}>
                  New job
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Take measurements for ${customer.data.fullName}`}
                onPress={() => router.push(`/customers/${id}/measurements/new` as never)}
                style={[styles.action, styles.actionSecondary]}
              >
                <AppText variant="label" weight="semiBold" color={colors.ink}>
                  Measure
                </AppText>
              </Pressable>
            </View>

            <SegmentedTabs
              accessibilityLabel="Customer sections"
              value={segment}
              onChange={setSegment}
              options={[
                { value: 'measurements', label: 'Measurements', count: versions.data?.length },
                { value: 'projects', label: 'Projects', count: projects.data?.length },
                { value: 'details', label: 'Details' },
              ]}
            />

            {segment === 'measurements' ? (
              versions.isLoading ? (
                <Card>
                  <SkeletonText lines={3} />
                </Card>
              ) : !current ? (
                <EmptyState
                  title="No measurements yet"
                  description="Record the first set — every version is kept, so re-measuring never loses the old numbers."
                  actionLabel="Take measurements"
                  onAction={() => router.push(`/customers/${id}/measurements/new` as never)}
                />
              ) : (
                <View style={styles.section}>
                  <Button
                    label={`New measurement · v${current.version + 1}`}
                    onPress={() => router.push(`/customers/${id}/measurements/new` as never)}
                  />
                  <Card tone="brand" style={styles.currentCard}>
                    <AppText variant="label">Version {current.version} · current</AppText>
                    <AppText variant="caption" color={colors.inkMuted}>
                      {formatLongDate(current.recordedAt)} · {current.unit === 'inches' ? 'inches' : 'centimetres'}
                    </AppText>
                    <View style={styles.valueGrid}>
                      {orderedFields
                        .filter((field) => typeof current.data[field.id] === 'number')
                        .map((field) => (
                          <View key={field.id} style={styles.valueCell}>
                            <AppText variant="caption" color={colors.inkMuted} numberOfLines={1}>
                              {field.label}
                            </AppText>
                            <AppText variant="label" weight="semiBold" tabular>
                              {formatMeasurement(current.data[field.id] as number, current.unit)}
                            </AppText>
                          </View>
                        ))}
                    </View>
                  </Card>

                  {(versions.data?.length ?? 0) > 1 ? (
                    <View style={styles.section}>
                      <AppText variant="h3">History</AppText>
                      {versions.data
                        ?.filter((version) => !version.isCurrent)
                        .map((version) => (
                          <Card key={version.id} style={styles.versionRow}>
                            <View style={styles.versionCopy}>
                              <AppText variant="label">Version {version.version}</AppText>
                              <AppText variant="caption" color={colors.inkMuted}>
                                {formatShortDate(version.recordedAt)} ·{' '}
                                {Object.values(version.data).filter((value) => typeof value === 'number').length} fields
                              </AppText>
                            </View>
                            <AppText variant="caption" color={colors.inkSubtle}>
                              {version.unit === 'inches' ? 'in' : 'cm'}
                            </AppText>
                          </Card>
                        ))}
                    </View>
                  ) : null}
                </View>
              )
            ) : null}

            {segment === 'projects' ? (
              projects.isLoading ? (
                <Card>
                  <SkeletonText lines={2} />
                </Card>
              ) : (projects.data?.length ?? 0) === 0 ? (
                <EmptyState
                  title="No projects yet"
                  description="Jobs you create for this customer appear here with their status and delivery date."
                />
              ) : (
                <View style={styles.section}>
                  {projects.data?.map((project) => (
                    <Card key={project.id} style={styles.versionRow}>
                      <View style={styles.versionCopy}>
                        <AppText variant="label">{project.name}</AppText>
                        <AppText variant="caption" color={colors.inkMuted}>
                          Due {formatShortDate(project.expectedDeliveryAt)}
                        </AppText>
                      </View>
                      <StatusPill status={project.status} />
                    </Card>
                  ))}
                </View>
              )
            ) : null}

            {segment === 'details' ? (
              <Card style={styles.section}>
                {[
                  ['Email', customer.data.email ?? '—'],
                  ['Birthday', customer.data.birthday ? formatLongDate(customer.data.birthday) : '—'],
                  ['Anniversary', customer.data.anniversary ? formatLongDate(customer.data.anniversary) : '—'],
                  ['Notes', customer.data.notes ?? '—'],
                ].map(([label, value]) => (
                  <View key={label} style={styles.detailRow}>
                    <AppText variant="caption" color={colors.inkMuted}>
                      {label}
                    </AppText>
                    <AppText variant="body">{value}</AppText>
                  </View>
                ))}
              </Card>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: layout.gutter, gap: spacing.lg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { minHeight: layout.touchTarget, justifyContent: 'center', alignSelf: 'flex-start' },
  loading: { gap: spacing.lg, alignItems: 'center', paddingTop: spacing.xl },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  identityCopy: { flex: 1, gap: spacing.xxs },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: {
    flex: 1,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  actionPrimary: { backgroundColor: colors.whatsappDeep },
  actionSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  section: { gap: spacing.sm },
  currentCard: { gap: spacing.xxs },
  valueGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md, marginTop: spacing.sm },
  valueCell: { width: '50%', gap: 2, paddingRight: spacing.sm },
  versionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  versionCopy: { flex: 1, gap: spacing.xxs },
  detailRow: { gap: 2, paddingVertical: spacing.xs },
});
