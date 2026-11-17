import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/StatusPill';
import { repo, type Customer, type Project } from '@/data';
import { dueLabel, daysUntil, formatShortDate } from '@/lib/date';
import { colors, layout, spacing } from '@/theme';

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        const [projectList, customerList] = await Promise.all([
          repo.projects.list('all'),
          repo.customers.list(),
        ]);
        if (!active) return;
        setProjects(projectList);
        setNames(Object.fromEntries(customerList.map((customer: Customer) => [customer.id, customer.fullName])));
        setLoading(false);
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  const active = projects.filter((p) => p.status === 'pending' || p.status === 'in_progress' || p.status === 'completed');
  const closed = projects.filter((p) => p.status === 'delivered' || p.status === 'archived');

  return (
    <Screen contentStyle={styles.content} bottomPadding={spacing.xxl + layout.tabBarHeight}>
      <View style={styles.header}>
        <AppText variant="h1">Projects</AppText>
        <AppText variant="body" color={colors.inkMuted}>
          {loading ? 'Loading…' : `${active.length} active · ${closed.length} delivered or archived`}
        </AppText>
      </View>

      <Card style={styles.note}>
        <AppText variant="label">Read-only preview</AppText>
        <AppText variant="caption" color={colors.inkMuted}>
          Creating jobs, changing status and archiving arrive in Phase 5. Statuses and delivery dates below are real data.
        </AppText>
      </Card>

      <View style={styles.section}>
        <AppText variant="h3">Active</AppText>
        {active.length === 0 ? (
          <Card>
            <AppText variant="body" color={colors.inkMuted}>
              No active jobs. New projects arrive in Phase 5.
            </AppText>
          </Card>
        ) : (
          active.map((project) => {
            const days = daysUntil(project.expectedDeliveryAt);
            return (
              <Card key={project.id} style={styles.row}>
                <View style={styles.rowCopy}>
                  <AppText variant="label">{project.name}</AppText>
                  <AppText variant="caption" color={colors.inkMuted}>
                    {names[project.customerId] ?? 'Customer'} · due {formatShortDate(project.expectedDeliveryAt)}
                  </AppText>
                  <AppText variant="caption" color={days < 0 ? colors.danger : colors.inkSubtle}>
                    {dueLabel(days)}
                  </AppText>
                </View>
                <StatusPill status={days < 0 && project.status !== 'completed' ? 'overdue' : project.status} />
              </Card>
            );
          })
        )}
      </View>

      {closed.length > 0 ? (
        <View style={styles.section}>
          <AppText variant="h3">Closed</AppText>
          {closed.map((project) => (
            <Card key={project.id} style={styles.row}>
              <View style={styles.rowCopy}>
                <AppText variant="label">{project.name}</AppText>
                <AppText variant="caption" color={colors.inkMuted}>
                  {names[project.customerId] ?? 'Customer'} · {formatShortDate(project.expectedDeliveryAt)}
                </AppText>
              </View>
              <StatusPill status={project.status} />
            </Card>
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.lg, gap: spacing.lg },
  header: { gap: spacing.xxs },
  note: { backgroundColor: colors.surfaceMuted, gap: spacing.xxs },
  section: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowCopy: { flex: 1, gap: spacing.xxs },
});
