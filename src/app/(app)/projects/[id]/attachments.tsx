import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { TextField } from '@/components/ui/TextField';
import { useToast } from '@/components/ui/Toast';
import { Wash } from '@/components/ui/Wash';
import { ProjectsIcon } from '@/components/ui/icons';
import { repositoryErrorCopy, toRepositoryError, type Attachment } from '@/data';
import { useProject, useUpdateProject } from '@/features/projects/queries';
import {
  ATTACHMENT_LIMIT,
  addAttachment,
  attachmentCountLabel,
  buildAttachment,
  canAddAttachment,
  nextSort,
  removeAttachment,
  setAttachmentCaption,
} from '@/features/projects/attachments';
import { imageErrorCopy, pickImage, takePhoto } from '@/lib/image';
import { colors, layout, radius, spacing } from '@/theme';

/**
 * Screen 29 (§5): attachments grid with add (library/camera), caption and
 * delete-one. Photos are compressed by `lib/image.ts` before they touch the
 * repository; P12 swaps local URIs for signed URLs without touching this screen.
 */
export default function AttachmentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const project = useProject(id);
  const update = useUpdateProject(id ?? '');

  const [selected, setSelected] = useState<Attachment | null>(null);
  const [caption, setCaption] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [picking, setPicking] = useState(false);

  const attachments = project.data?.attachments ?? [];
  const full = !canAddAttachment(attachments.length);

  function persist(next: Attachment[], message?: string) {
    update.mutate(
      { attachments: next },
      {
        onSuccess: () => {
          if (message) toast.show({ message, tone: 'success' });
        },
        onError: (error) =>
          toast.show({
            message: repositoryErrorCopy[toRepositoryError(error).code],
            tone: 'danger',
            duration: 6000,
          }),
      },
    );
  }

  async function add(source: 'library' | 'camera') {
    if (full) {
      toast.show({ message: `That is the limit — ${ATTACHMENT_LIMIT} attachments per job.` });
      return;
    }

    try {
      setPicking(true);
      const picked =
        source === 'camera'
          ? await takePhoto({ maxWidth: 1200 })
          : await pickImage({ maxWidth: 1200, allowsEditing: false });
      if (!picked) return;

      const attachment = buildAttachment(
        { uri: picked.uri, width: picked.width, height: picked.height, kind: 'photo' },
        nextSort(attachments),
      );
      persist(addAttachment(attachments, attachment));
    } catch (caught) {
      const code = caught instanceof Error && caught.message === 'permission_denied' ? 'permission_denied' : 'unknown';
      toast.show({ message: imageErrorCopy[code], tone: 'danger', duration: 6000 });
    } finally {
      setPicking(false);
    }
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
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to the job"
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.back}
        >
          <AppText variant="label" weight="semiBold" color={colors.primary}>
            ← {project.data?.name ?? 'Job'}
          </AppText>
        </Pressable>

        <View style={styles.header}>
          <AppText variant="h1">Attachments</AppText>
          <AppText variant="body" color={colors.inkMuted}>
            {project.isLoading
              ? 'Loading…'
              : `${attachmentCountLabel(attachments.length)} · up to ${ATTACHMENT_LIMIT}, compressed before saving`}
          </AppText>
        </View>

        <View style={styles.actions}>
          <Button
            label="Add photo"
            loading={picking}
            disabled={full}
            onPress={() => void add('library')}
            fullWidth={false}
          />
          <Button
            label="Take photo"
            variant="secondary"
            disabled={picking || full}
            onPress={() => void add('camera')}
            fullWidth={false}
          />
        </View>

        {project.isLoading ? (
          <View style={styles.grid}>
            <Skeleton height={150} round={radius.md} style={styles.tile} />
            <Skeleton height={150} round={radius.md} style={styles.tile} />
          </View>
        ) : attachments.length === 0 ? (
          <EmptyState
            icon={<ProjectsIcon size={26} color={colors.primary} />}
            title="No photos yet"
            description="Add design references, fabric shots or the customer's WhatsApp screenshot. Tap a photo later to caption or remove it."
            actionLabel="Add photo"
            onAction={() => void add('library')}
          />
        ) : (
          <View style={styles.grid}>
            {attachments.map((attachment) => (
              <Pressable
                key={attachment.id}
                accessibilityRole="button"
                accessibilityLabel={attachment.caption ?? 'Photo'}
                onPress={() => {
                  setSelected(attachment);
                  setCaption(attachment.caption ?? '');
                }}
                style={styles.tile}
              >
                <Image
                  source={{ uri: attachment.url }}
                  style={styles.image}
                  contentFit="cover"
                  transition={120}
                  accessibilityLabel={attachment.caption ?? 'Job photo'}
                />
                {attachment.caption ? (
                  <View style={styles.captionBar}>
                    <AppText variant="caption" color={colors.white} numberOfLines={1}>
                      {attachment.caption}
                    </AppText>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <Sheet
        visible={selected !== null}
        onClose={() => setSelected(null)}
        title="Photo"
        subtitle={selected?.caption ? 'Edit the caption or remove it' : 'Add a caption so the job reads clearly later'}
        footer={
          <View style={styles.sheetActions}>
            <Button
              label="Save caption"
              loading={update.isPending}
              onPress={() => {
                if (!selected) return;
                persist(setAttachmentCaption(attachments, selected.id, caption), 'Caption saved');
                setSelected(null);
              }}
            />
            <Button label="Remove photo" variant="danger" onPress={() => setConfirmRemove(true)} />
          </View>
        }
      >
        <TextField
          label="Caption"
          value={caption}
          onChangeText={setCaption}
          placeholder="Ivory satin, beaded bodice"
          maxLength={120}
        />
      </Sheet>

      <ConfirmDialog
        visible={confirmRemove}
        title="Remove this photo?"
        message="It disappears from the job. Measurements and status history are untouched."
        confirmLabel="Remove photo"
        destructive
        onCancel={() => setConfirmRemove(false)}
        onConfirm={() => {
          if (!selected) return;
          setConfirmRemove(false);
          persist(removeAttachment(attachments, selected.id), 'Photo removed');
          setSelected(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: layout.gutter, gap: spacing.lg },
  back: { minHeight: layout.touchTarget, justifyContent: 'center', alignSelf: 'flex-start' },
  header: { gap: spacing.xxs },
  actions: { flexDirection: 'row', gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    width: '48%',
    flexGrow: 1,
    aspectRatio: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  image: { width: '100%', height: '100%' },
  captionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(20,17,15,0.55)',
  },
  sheetActions: { gap: spacing.sm },
});
