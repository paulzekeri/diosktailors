import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { repo, type Reminder } from '@/data';
import { dueLabel } from '@/lib/date';
import { colors, layout, spacing } from '@/theme';

const KIND_LABEL: Record<Reminder['kind'], string> = {
  delivery: 'Delivery',
  follow_up: 'Follow up',
  birthday: 'Birthday',
  anniversary: 'Anniversary',
};

export default function DueScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        const due = await repo.reminders.due(7);
        if (!active) return;
        setReminders(due);
        setLoading(false);
      })();
      return () => {
        active = false;
      };
    }, []),
  );

  const overdue = reminders.filter((item) => item.daysUntil < 0);
  const today = reminders.filter((item) => item.daysUntil === 0);
  const week = reminders.filter((item) => item.daysUntil > 0);

  function renderGroup(title: string, items: Reminder[], tone: string) {
    if (items.length === 0) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="h3">{title}</AppText>
          <AppText variant="caption" color={tone}>
            {items.length}
          </AppText>
        </View>
        {items.map((item) => (
          <Card key={item.id} style={styles.row}>
            <View style={styles.rowCopy}>
              <AppText variant="label">
                {item.projectName ? `${item.projectName} · ${item.customerName}` : item.customerName}
              </AppText>
              <AppText variant="caption" color={colors.inkMuted}>
                {KIND_LABEL[item.kind]} · {dueLabel(item.daysUntil)}
              </AppText>
            </View>
          </Card>
        ))}
      </View>
    );
  }

  return (
    <Screen contentStyle={styles.content} bottomPadding={spacing.xxl + layout.tabBarHeight}>
      <View style={styles.header}>
        <AppText variant="h1">Due</AppText>
        <AppText variant="body" color={colors.inkMuted}>
          {loading ? 'Loading…' : reminders.length === 0 ? 'Nothing in the next 7 days' : 'Next 7 days'}
        </AppText>
      </View>

      {!loading && reminders.length === 0 ? (
        <Card>
          <AppText variant="label">All clear</AppText>
          <AppText variant="caption" color={colors.inkMuted}>
            No deliveries, birthdays or anniversaries in the next seven days.
          </AppText>
        </Card>
      ) : null}

      {renderGroup('Overdue', overdue, colors.danger)}
      {renderGroup('Today', today, colors.primary)}
      {renderGroup('This week', week, colors.inkMuted)}

      <Card style={styles.note}>
        <AppText variant="label">Coming in Phase 8</AppText>
        <AppText variant="caption" color={colors.inkMuted}>
          One-tap WhatsApp nudges, editable message templates and device reminders land here. The list itself already
          comes from real project dates.
        </AppText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.lg, gap: spacing.lg },
  header: { gap: spacing.xxs },
  section: { gap: spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowCopy: { flex: 1, gap: spacing.xxs },
  note: { backgroundColor: colors.surfaceMuted, gap: spacing.xxs },
});
