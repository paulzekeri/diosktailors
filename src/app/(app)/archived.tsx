import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchField } from '@/components/ui/SearchField';
import { SkeletonList } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { Wash } from '@/components/ui/Wash';
import { ProjectsIcon } from '@/components/ui/icons';
import { useCustomers } from '@/features/customers/queries';
import { useProjects, useSetProjectStatus } from '@/features/projects/queries';
import { actionsFor } from '@/features/projects/status';
import { formatShortDate } from '@/lib/date';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { repositoryErrorCopy, toRepositoryError, type Project } from '@/data';
import { colors, layout, spacing } from '@/theme';

/**
 * Screen 30 (§5): archived jobs grouped by year, searchable, with reopen.
 * Reopen copy comes from the status machine, so this confirmation and the one
 * on the detail screen can never diverge.
 */
export default function ArchivedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const archived = useProjects('archived');
  const customers = useCustomers('');
  const setStatus = useSetProjectStatus();

  const [term, setTerm] = useState('');
  const debounced = useDebouncedValue(term, 250);
  const [pending, setPending] = useState<Project | null>(null);

  const names = useMemo(
    () => Object.fromEntries((customers.data ?? []).map((customer) => [customer.id, customer.fullName])),
    [customers.data],
  );

  const years = useMemo(() => {
    const query = debounced.trim().toLowerCase();
    const rows = (archived.data ?? []).filter((project) => {
      if (!query) return true;
      const customer = names[project.customerId] ?? '';
      return project.name.toLowerCase().includes(query) || customer.toLowerCase().includes(query);
    });

    const buckets = new Map<string, Project[]>();
    for (const project of rows) {
      const year = (project.collectedAt ?? project.expectedDeliveryAt).slice(0, 4);
      const bucket = buckets.get(year);
      if (bucket) bucket.push(project);
      else buckets.set(year, [project]);
    }

    return [...buckets.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [archived.data, debounced, names]);

  const reopen = actionsFor('archived')[0];

  function confirmReopen() {
    const project = pending;
    if (!project) return;
    setPending(null);

    setStatus.mutate(
      { id: project.id, status: 'in_progress' },
      {
        onSuccess: () => toast.show({ message: `${project.name} reopened`, tone: 'success' }),
        onError: (error) =>
          toast.show({
            message: repositoryErrorCopy[toRepositoryError(error).code],
            tone: 'danger',
            duration: 6000,
          }),
      },
    );
  }

  return (
    <View style={styles.page}>
      <Wash variant="screen" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.back}
        >
          <AppText variant="label" weight="semiBold" color={colors.primary}>
            ← Projects
          </AppText>
        </Pressable>

        <View style={styles.header}>
          <AppText variant="h1">Archived</AppText>
          <AppText variant="body" color={colors.inkMuted}>
            Finished jobs, newest year first. Reopening puts a job back in progress.
          </AppText>
        </View>

        <SearchField
          value={term}
          onChangeText={setTerm}
          placeholder="Search archived jobs"
          accessibilityLabel="Search archived jobs"
        />

        {archived.isLoading ? (
          <SkeletonList rows={3} />
        ) : archived.isError ? (
          <EmptyState
            tone="error"
            icon={<ProjectsIcon size={26} color={colors.danger} />}
            title="Could not load the archive"
            description={repositoryErrorCopy[toRepositoryError(archived.error).code]}
            actionLabel="Try again"
            onAction={() => void archived.refetch()}
          />
        ) : years.length === 0 ? (
          <EmptyState
            icon={<ProjectsIcon size={26} color={colors.primary} />}
            title={debounced.trim() ? 'No matches' : 'Nothing archived'}
            description={
              debounced.trim()
                ? `No archived job matches “${debounced.trim()}”.`
                : 'Jobs you archive after delivery are filed here by year.'
            }
          />
        ) : (
          years.map(([year, rows]) => (
            <View key={year} style={styles.year}>
              <View style={styles.yearHeader}>
                <AppText variant="h3">{year}</AppText>
                <AppText variant="caption" color={colors.inkMuted}>
                  {rows.length}
                </AppText>
              </View>
              {rows.map((project) => (
                <Card key={project.id} style={styles.row}>
                  <View style={styles.rowCopy}>
                    <AppText variant="label" numberOfLines={1}>
                      {project.name}
                    </AppText>
                    <AppText variant="caption" color={colors.inkMuted} numberOfLines={1}>
                      {names[project.customerId] ?? 'Customer'} ·{' '}
                      {project.collectedAt
                        ? `collected ${formatShortDate(project.collectedAt)}`
                        : `due ${formatShortDate(project.expectedDeliveryAt)}`}
                    </AppText>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Reopen ${project.name}`}
                    onPress={() => setPending(project)}
                    hitSlop={8}
                    style={styles.reopen}
                  >
                    <AppText variant="caption" weight="semiBold" color={colors.primary}>
                      Reopen
                    </AppText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${project.name}`}
                    onPress={() => router.push(`/projects/${project.id}` as never)}
                    hitSlop={8}
                  >
                    <AppText variant="caption" weight="semiBold" color={colors.inkMuted}>
                      View
                    </AppText>
                  </Pressable>
                </Card>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <ConfirmDialog
        visible={pending !== null}
        title={reopen.confirm?.title ?? 'Reopen this job?'}
        message={reopen.confirm?.message ?? ''}
        confirmLabel={reopen.confirm?.confirmLabel ?? 'Reopen job'}
        loading={setStatus.isPending}
        onCancel={() => setPending(null)}
        onConfirm={confirmReopen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: layout.gutter, gap: spacing.lg },
  back: { minHeight: layout.touchTarget, justifyContent: 'center', alignSelf: 'flex-start' },
  header: { gap: spacing.xxs },
  year: { gap: spacing.sm },
  yearHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: layout.rowHeight },
  rowCopy: { flex: 1, gap: spacing.xxs },
  reopen: { minHeight: layout.touchTarget, justifyContent: 'center', paddingHorizontal: spacing.xs },
});
