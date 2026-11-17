import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { Wash } from '@/components/ui/Wash';
import { repositoryErrorCopy, toRepositoryError, type FieldGroup, type Template, type TemplateField } from '@/data';
import { useSaveTemplate, useTemplate } from '@/features/templates/queries';
import {
  createField,
  moveField,
  orderedFields,
  removeField,
  renameField,
  setFieldRequired,
} from '@/features/templates/fields';
import { validateNewField, validateRename, validateTemplate } from '@/features/templates/validation';
import type { FieldErrors } from '@/lib/forms';
import { colors, layout, radius, spacing } from '@/theme';

const GROUPS: ReadonlyArray<{ value: FieldGroup; label: string }> = [
  { value: 'upper', label: 'Upper body' },
  { value: 'lower', label: 'Lower body' },
  { value: 'length', label: 'Lengths' },
  { value: 'custom', label: 'Custom' },
];

const groupLabel = (group: FieldGroup) => GROUPS.find((option) => option.value === group)?.label ?? group;

/**
 * Screen 32 (§5): template editor. Renaming changes the label only — the field id
 * is permanent, so measurements already saved keep their values. Adding a field
 * creates a new permanent id, which is the custom-field path.
 */
export default function TemplateEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const { data: template, isLoading, isError, error, refetch } = useTemplate(id);
  const save = useSaveTemplate();

  const [draft, setDraft] = useState<Template | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [editing, setEditing] = useState<TemplateField | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editRequired, setEditRequired] = useState(false);
  const [editError, setEditError] = useState<string | undefined>();

  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newGroup, setNewGroup] = useState<FieldGroup>('custom');
  const [addError, setAddError] = useState<{ label?: string }>({});

  useEffect(() => {
    if (template && !draft) setDraft(template);
  }, [template, draft]);

  const fields = useMemo(() => orderedFields(draft?.fields ?? []), [draft]);

  function applyFields(next: TemplateField[]) {
    setDraft((previous) => (previous ? { ...previous, fields: next } : previous));
  }

  function openField(field: TemplateField) {
    setEditing(field);
    setEditLabel(field.label);
    setEditRequired(Boolean(field.required));
    setEditError(undefined);
  }

  function saveFieldEdit() {
    if (!editing || !draft) return;
    const result = validateRename(draft.fields, editing.id, editLabel);
    if (!result.success) {
      setEditError(result.errors.label);
      return;
    }
    applyFields(setFieldRequired(renameField(draft.fields, editing.id, result.label), editing.id, editRequired));
    setEditing(null);
  }

  function deleteField() {
    if (!editing || !draft) return;
    applyFields(removeField(draft.fields, editing.id));
    setEditing(null);
    toast.show({ message: `${editing.label} removed · saved measurements keep their numbers` });
  }

  function addField() {
    if (!draft) return;
    const result = validateNewField(draft.fields, { label: newLabel, group: newGroup });
    if (!result.success) {
      setAddError({ label: result.errors.label });
      return;
    }
    applyFields([...draft.fields, createField(draft.fields, { label: result.data.label, group: result.data.group })]);
    setAdding(false);
    setNewLabel('');
    setNewGroup('custom');
    setAddError({});
    toast.show({ message: `${result.data.label} added` });
  }

  function persist() {
    if (!draft) return;
    const result = validateTemplate(draft.name, draft.fields);
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    save.mutate({ ...draft, name: result.name }, {
      onSuccess: () => toast.show({ message: 'Template saved', tone: 'success' }),
      onError: (caught) =>
        toast.show({
          message: repositoryErrorCopy[toRepositoryError(caught).code],
          tone: 'danger',
          duration: 6000,
        }),
    });
  }

  return (
    <View style={styles.page}>
      <Stack.Screen options={{ animation: 'slide_from_right' }} />
      <Wash variant="screen" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to templates"
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.back}
        >
          <AppText variant="label" weight="semiBold" color={colors.primary}>
            ← Templates
          </AppText>
        </Pressable>

        {isLoading ? (
          <View style={styles.loading}>
            <Skeleton width="60%" height={28} />
            <SkeletonText lines={2} />
          </View>
        ) : isError || !draft ? (
          <EmptyState
            tone="error"
            title="Template unavailable"
            description={repositoryErrorCopy[toRepositoryError(error).code]}
            actionLabel="Try again"
            onAction={() => void refetch()}
          />
        ) : (
          <>
            <View style={styles.header}>
              <AppText variant="h1">Edit template</AppText>
              <AppText variant="body" color={colors.inkMuted}>
                {fields.length} fields · rename freely, add your own, reorder with the arrows
              </AppText>
            </View>

            <TextField
              label="Template name"
              value={draft.name}
              onChangeText={(name) => setDraft({ ...draft, name })}
              error={errors.name}
              placeholder="Women — Standard"
            />

            <View style={styles.list}>
              {fields.map((field, index) => (
                <Card
                  key={field.id}
                  style={styles.row}
                  onPress={() => openField(field)}
                  accessibilityLabel={`Edit ${field.label}`}
                >
                  <View style={styles.position}>
                    <AppText variant="caption" weight="semiBold" color={colors.inkSubtle}>
                      {index + 1}
                    </AppText>
                  </View>
                  <View style={styles.copy}>
                    <AppText variant="label" numberOfLines={1}>
                      {field.label}
                      {field.required ? ' *' : ''}
                    </AppText>
                    <AppText variant="caption" color={colors.inkMuted} numberOfLines={1}>
                      {groupLabel(field.group)}
                      {field.unit ? ` · ${field.unit === 'inches' ? 'in' : 'cm'}` : ''}
                      {field.id.startsWith('custom_') ? ' · custom' : ''}
                    </AppText>
                  </View>
                  <View style={styles.moves}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Move ${field.label} up`}
                      disabled={index === 0}
                      onPress={() => applyFields(moveField(draft.fields, field.id, -1))}
                      hitSlop={6}
                      style={[styles.move, index === 0 && styles.moveDisabled]}
                    >
                      <AppText variant="label" weight="semiBold" color={colors.inkMuted}>
                        ↑
                      </AppText>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Move ${field.label} down`}
                      disabled={index === fields.length - 1}
                      onPress={() => applyFields(moveField(draft.fields, field.id, 1))}
                      hitSlop={6}
                      style={[styles.move, index === fields.length - 1 && styles.moveDisabled]}
                    >
                      <AppText variant="label" weight="semiBold" color={colors.inkMuted}>
                        ↓
                      </AppText>
                    </Pressable>
                  </View>
                </Card>
              ))}
            </View>

            {errors.fields ? (
              <AppText variant="caption" color={colors.danger}>
                {errors.fields}
              </AppText>
            ) : null}

            <Button label="Add a field" variant="secondary" onPress={() => setAdding(true)} />
          </>
        )}
      </ScrollView>

      {draft ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <Button label="Save template" loading={save.isPending} onPress={persist} />
        </View>
      ) : null}

      <Sheet
        visible={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.label ?? 'Field'}
        subtitle="Renaming keeps every saved value — the field itself never changes."
        footer={
          <View style={styles.sheetActions}>
            <Button label="Save field" onPress={saveFieldEdit} />
            <Button label="Remove field" variant="danger" onPress={deleteField} />
          </View>
        }
      >
        <TextField label="Name" value={editLabel} onChangeText={setEditLabel} error={editError} maxLength={40} />
        <Checkbox checked={editRequired} onChange={setEditRequired} label="Required when recording measurements" />
        <AppText variant="caption" color={colors.inkSubtle}>
          Removing hides this field from new measurements. Values already saved stay under its id, so history and
          comparisons still show them.
        </AppText>
      </Sheet>

      <Sheet
        visible={adding}
        onClose={() => setAdding(false)}
        title="Add a field"
        subtitle="Anything your work needs that the standard list does not cover."
        footer={<Button label="Add field" onPress={addField} />}
      >
        <TextField
          label="Name"
          value={newLabel}
          onChangeText={setNewLabel}
          error={addError.label}
          placeholder="Head circumference"
          maxLength={40}
        />
        <View style={styles.groupChips}>
          {GROUPS.map((option) => {
            const active = option.value === newGroup;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={option.label}
                onPress={() => setNewGroup(option.value)}
                style={[styles.groupChip, active && styles.groupChipActive]}
              >
                <AppText
                  variant="caption"
                  weight={active ? 'semiBold' : 'medium'}
                  color={active ? colors.canvas : colors.inkMuted}
                >
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: layout.gutter, gap: spacing.lg },
  back: { minHeight: layout.touchTarget, justifyContent: 'center', alignSelf: 'flex-start' },
  loading: { gap: spacing.lg },
  header: { gap: spacing.xxs },
  list: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  position: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  copy: { flex: 1, gap: spacing.xxs },
  moves: { flexDirection: 'row', gap: spacing.xs },
  move: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  moveDisabled: { opacity: 0.35 },
  groupChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  groupChip: {
    minHeight: layout.touchTarget - 8,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  groupChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sheetActions: { gap: spacing.sm },
  footer: {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.md,
    backgroundColor: colors.canvasDeep,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
});
