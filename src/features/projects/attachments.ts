/**
 * Attachment helpers (screen 29). Pure list maths so the screen only deals with
 * picking, captions and errors. In the mock phase `url` is a local file URI; P12
 * swaps it for a private-bucket signed URL without changing this module.
 */
import type { Attachment, AttachmentKind } from '@/data/types';

/** Keep the grid light in the mock phase; photos are compressed before they get here. */
export const ATTACHMENT_LIMIT = 12;

export function nextSort(attachments: Attachment[]): number {
  return attachments.reduce((max, item) => Math.max(max, item.sort), 0) + 1;
}

export interface DraftAttachment {
  uri: string;
  width?: number;
  height?: number;
  kind?: AttachmentKind;
  caption?: string;
}

/** Client-side id for the mock phase; P12 uses the storage object key instead. */
export function attachmentId(seed: number = Date.now()): string {
  return `att_${seed.toString(36)}`;
}

export function buildAttachment(draft: DraftAttachment, sort: number, seed?: number): Attachment {
  return {
    id: attachmentId(seed),
    kind: draft.kind ?? 'photo',
    url: draft.uri,
    caption: draft.caption?.trim() || undefined,
    width: draft.width,
    height: draft.height,
    sort,
  };
}

export function addAttachment(attachments: Attachment[], attachment: Attachment): Attachment[] {
  return [...attachments, attachment].sort((a, b) => a.sort - b.sort);
}

export function removeAttachment(attachments: Attachment[], id: string): Attachment[] {
  return attachments.filter((item) => item.id !== id);
}

export function setAttachmentCaption(attachments: Attachment[], id: string, caption: string): Attachment[] {
  return attachments.map((item) => (item.id === id ? { ...item, caption: caption.trim() || undefined } : item));
}

export function attachmentCountLabel(count: number): string {
  return count === 1 ? '1 attachment' : `${count} attachments`;
}

export function canAddAttachment(count: number): boolean {
  return count < ATTACHMENT_LIMIT;
}
