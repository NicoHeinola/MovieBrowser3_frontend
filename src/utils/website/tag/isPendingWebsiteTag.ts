import type { WebsiteTag } from '@/interfaces/api/models/WebsiteTag';

/**
 * Checks whether a tag is only pending in a form, see `createPendingWebsiteTag`.
 * @param tag - The tag.
 * @returns True for tags not saved yet.
 */
export const isPendingWebsiteTag = (tag: Pick<WebsiteTag, 'id'>): boolean => tag.id < 0;
