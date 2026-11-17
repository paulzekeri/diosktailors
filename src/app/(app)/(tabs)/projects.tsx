import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Skeleton';
import { StatusPill } from '@/components/ui/StatusPill';
import { ProjectsIcon } from '@/components/ui/icons';
import { repositoryErrorCopy, toRepositoryError, type ProjectFilter } from '@/data';
import { useCustomers } from '@/features/customers/queries';
import { useProjects } from '@/features/projects/queries';
import { daysLate, isClosed, isOverdue, pillStatus } from '@/features/projects/status';
import { daysUntil, dueLabel, formatShortDate } from '@/lib/date';
import { colors, layout, radius, spacing } from '@/theme';

const FILTERS: ReadonlyArray<{ value: ProjectFilter; label: string }> = [
  { value: 'active', label: 'Active' },
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'archived', label: 'Archived' },
];

const EMPTY_COPY: Record<ProjectFilter, { title: string; description: string }> = {
  active: {
    title: 'No active jobs',
    description: 'Jobs appear here as soon as you create one for a customer.',
  },
  all: { title: 'No projects yet', description: 'Create a job from a customer profile to start tracking it.' },
  completed: {
    title: 'Nothing completed',
    description: 'Finished work lands here until you mark it delivered.',
  },
  delivered: {
    title: 'Nothing delivered',
    description: 'Delivered jobs wait here until you archive them.',
  },
  archived: { title: 'Nothing archived', description: 'Archived jobs are hidden from active lists but never deleted.' },
};

/**
 * Screen 16 (§5): projects with filters. Status moves happen on the detail
 * screen — this list only reads, so a mis-tap can never change a job's state.
 */
export default function ProjectsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<ProjectFilter>('active');

  const projects = useProjects(filter);
  const customers = useCustomers('');

  const names = useMemo(
    () => Object.fromEntries((customers.data ?? []).map((customer) => [customer.id, customer.fullName])),
    [customers.data],
  );

  const rows = projects.data ?? [];
  const openCount = rows.filter((project) => !['delivered', 'archived'].includes(project.status)).length;
  const filterLabel = FILTERS.find((option) => option.value === filter)?.label.toLowerCase() ?? '';

  return (
    <Screen contentStyle={styles.content} bottomPadding={spacing.xxl + layout.tabBarHeight}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <AppText variant="h1">Projects</AppText>
          <AppText variant="body" color={colors.inkMuted}>
            {projects.isLoading
              ? 'Loading…'
              : filter === 'all'
                ? `${rows.length} total${openCount ? ` · ${openCount} open` : ''}`
                : `${rows.length} ${filterLabel}`}
          </AppText>
        </View>

        <View style={styles.filters}>
          {FILTERS.map((option) => {
            const selected = option.value === filter;
            return (
              <Pressable
                key={option.value}
                role="tab"
                aria-selected={selected}
                accessibilityLabel={`Show ${option.label.toLowerCase()} projects`}
                onPress={() => setFilter(option.value)}
                style={[styles.filterChip, selected && styles.filterChipActive]}
              >
                <AppText
                  variant="caption"
                  weight={selected ? 'semiBold' : 'medium'}
                  color={selected ? colors.canvas : colors.inkMuted}
                >
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {projects.isLoading ? (
        <SkeletonList rows={4} />
      ) : projects.isError ? (
        <EmptyState
          tone="error"
          icon={<ProjectsIcon size={26} color={colors.danger} />}
          title="Could not load projects"
          description={repositoryErrorCopy[toRepositoryError(projects.error).code]}
          actionLabel="Try again"
          onAction={() => void projects.refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<ProjectsIcon size={26} color={colors.primary} />}
          title={EMPTY_COPY[filter].title}
          description={EMPTY_COPY[filter].description}
        />
      ) : (
        <View style={styles.list}>
          {rows.map((project) => {
            const late = isOverdue(project);
            const days = daysUntil(project.expectedDeliveryAt);
            const lateBy = daysLate(project);
            return (
              <Card
                key={project.id}
                style={styles.row}
                accent={late ? 'danger' : undefined}
                onPress={() => router.push(`/projects/${project.id}` as never)}
                accessibilityLabel={`${project.name} for ${names[project.customerId] ?? 'customer'}, ${dueLabel(days)}`}
              >
                <View style={styles.rowCopy}>
                  <AppText variant="label" numberOfLines={1}>
                    {project.name}
                  </AppText>
                  <AppText variant="caption" color={colors.inkMuted} numberOfLines={1}>
                    {names[project.customerId] ?? 'Customer'} · due {formatShortDate(project.expectedDeliveryAt)}
                  </AppText>
                  <View style={styles.meta}>
                    <AppText variant="caption" color={late ? colors.danger : colors.inkMuted}>
                      {late
                        ? `${lateBy} ${lateBy === 1 ? 'day late' : 'days late'}`
                        : isClosed(project.status)
                          ? `Closed ${formatShortDate(project.expectedDeliveryAt)}`
                          : dueLabel(days)}
                    </AppText>
                    <AppText variant="caption" weight="semiBold" color={colors.primary}>
                      View details
                    </AppText>
                  </View>
                </View>
                <StatusPill status={pillStatus(project)} />
              </Card>
            );
          })}
        </View>
      )}

      {filter === 'archived' && rows.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Browse archived jobs by year"
          onPress={() => router.push('/archived' as never)}
          style={styles.archiveLink}
        >
          <AppText variant="caption" weight="semiBold" color={colors.primary}>
            Browse by year and reopen
          </AppText>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.lg, gap: spacing.lg },
  header: { gap: spacing.md },
  headerCopy: { gap: spacing.xxs },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  filterChip: {
    minHeight: layout.touchTarget - 8,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: layout.rowHeight },
  rowCopy: { flex: 1, gap: spacing.xxs },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  archiveLink: { minHeight: layout.touchTarget, alignItems: 'center', justifyContent: 'center' },
});
