import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { goBack } from '@/lib/navigation';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Skeleton';
import { Wash } from '@/components/ui/Wash';
import { TemplatesIcon } from '@/components/ui/icons';
import { repositoryErrorCopy, toRepositoryError } from '@/data';
import { useTemplates } from '@/features/templates/queries';
import { colors, layout, radius, spacing } from '@/theme';

/**
 * Screen 31 (§5): the business's templates. Standard templates arrive from
 * onboarding and stay editable, including adding fields the seeded list never had.
 */
export default function TemplatesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const templates = useTemplates();

  const list = templates.data ?? [];
  const totalFields = list.reduce((sum, template) => sum + template.fields.length, 0);

  return (
    <View style={styles.page}>
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
          accessibilityLabel="Back to settings"
          onPress={() => goBack(router, "/settings")}
          hitSlop={10}
          style={styles.back}
        >
          <AppText variant="label" weight="semiBold" color={colors.primary}>
            ← Settings
          </AppText>
        </Pressable>

        <View style={styles.header}>
          <AppText variant="h1">Templates</AppText>
          <AppText variant="body" color={colors.inkMuted}>
            {templates.isLoading
              ? 'Loading…'
              : `${list.length} ${list.length === 1 ? 'template' : 'templates'} · ${totalFields} fields in total`}
          </AppText>
        </View>

        {templates.isLoading ? (
          <SkeletonList rows={2} />
        ) : templates.isError ? (
          <EmptyState
            tone="error"
            icon={<TemplatesIcon size={26} color={colors.danger} />}
            title="Could not load templates"
            description={repositoryErrorCopy[toRepositoryError(templates.error).code]}
            actionLabel="Try again"
            onAction={() => void templates.refetch()}
          />
        ) : list.length === 0 ? (
          <EmptyState
            icon={<TemplatesIcon size={26} color={colors.primary} />}
            title="No templates yet"
            description="Finish onboarding to seed the standard templates, then adapt them here."
          />
        ) : (
          <View style={styles.list}>
            {list.map((template) => (
              <Card
                key={template.id}
                style={styles.row}
                onPress={() => router.push(`/templates/${template.id}` as never)}
                accessibilityLabel={`Edit ${template.name}`}
              >
                <View style={styles.copy}>
                  <AppText variant="label" numberOfLines={1}>
                    {template.name}
                  </AppText>
                  <AppText variant="caption" color={colors.inkMuted}>
                    {template.fields.length} fields
                    {template.isDefault ? ' · used for new measurements' : ''}
                  </AppText>
                </View>
                {template.isDefault ? (
                  <View style={styles.badge}>
                    <AppText variant="caption" weight="semiBold" color={colors.primary}>
                      Default
                    </AppText>
                  </View>
                ) : null}
                <AppText variant="caption" weight="semiBold" color={colors.primary}>
                  Edit
                </AppText>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: layout.gutter, gap: spacing.lg },
  back: { minHeight: layout.touchTarget, justifyContent: 'center', alignSelf: 'flex-start' },
  header: { gap: spacing.xxs },
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: layout.rowHeight },
  copy: { flex: 1, gap: spacing.xxs },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.primaryTint,
  },
});
