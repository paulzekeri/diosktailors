import { describe, expect, it } from 'vitest';

import type { Attachment } from '@/data/types';
import {
  ATTACHMENT_LIMIT,
  addAttachment,
  attachmentCountLabel,
  buildAttachment,
  canAddAttachment,
  nextSort,
  removeAttachment,
  setAttachmentCaption,
} from '../attachments';

const attachment = (id: string, sort: number, caption?: string) =>
  ({ id, kind: 'photo', url: `file://${id}.jpg`, sort, caption }) as Attachment;

describe('nextSort and buildAttachment', () => {
  it('starts at 1 and follows the highest sort', () => {
    expect(nextSort([])).toBe(1);
    expect(nextSort([attachment('a', 1), attachment('b', 7)])).toBe(8);
  });

  it('builds a photo by default with a trimmed caption', () => {
    const built = buildAttachment({ uri: 'file://x.jpg', caption: '  Lace trim  ' }, 3);
    expect(built).toMatchObject({ kind: 'photo', url: 'file://x.jpg', caption: 'Lace trim', sort: 3 });
    expect(built.id).toMatch(/^att_/);
  });

  it('drops an empty caption instead of storing whitespace', () => {
    expect(buildAttachment({ uri: 'file://x.jpg', caption: '   ' }, 1).caption).toBeUndefined();
  });

  it('keeps the kind it was given (reference, screenshot, voice)', () => {
    expect(buildAttachment({ uri: 'file://x.jpg', kind: 'wa_screenshot' }, 1).kind).toBe('wa_screenshot');
  });
});

describe('list maths', () => {
  it('appends in sort order', () => {
    const list = addAttachment([attachment('b', 2)], attachment('a', 1));
    expect(list.map((item) => item.id)).toEqual(['a', 'b']);
  });

  it('removes only the requested attachment', () => {
    const list = removeAttachment([attachment('a', 1), attachment('b', 2)], 'a');
    expect(list.map((item) => item.id)).toEqual(['b']);
  });

  it('sets and clears a caption', () => {
    const withCaption = setAttachmentCaption([attachment('a', 1)], 'a', '  Beaded cuff ');
    expect(withCaption[0].caption).toBe('Beaded cuff');
    expect(setAttachmentCaption(withCaption, 'a', '   ')[0].caption).toBeUndefined();
  });

  it('labels the count and enforces the cap', () => {
    expect(attachmentCountLabel(1)).toBe('1 attachment');
    expect(attachmentCountLabel(3)).toBe('3 attachments');
    expect(canAddAttachment(ATTACHMENT_LIMIT - 1)).toBe(true);
    expect(canAddAttachment(ATTACHMENT_LIMIT)).toBe(false);
  });
});
