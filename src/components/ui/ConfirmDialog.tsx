import { StyleSheet, View } from 'react-native';

import { Button } from './Button';
import { Sheet } from './Sheet';
import { spacing } from '@/theme';

type Props = {
  visible: boolean;
  title: string;
  /** Full sentence — the consequence is spelled out, never implied. */
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive actions are red and never the default focus. */
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Confirmation for irreversible-looking steps (mark delivered, archive, delete).
 * The design contract requires a second, explicit confirmation for archiving.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Sheet
      visible={visible}
      onClose={onCancel}
      title={title}
      subtitle={message}
      dismissable={!loading}
      footer={
        <View style={styles.actions}>
          <Button label={confirmLabel} variant={destructive ? 'danger' : 'primary'} loading={loading} onPress={onConfirm} />
          <Button label={cancelLabel} variant="secondary" disabled={loading} onPress={onCancel} />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm },
});
