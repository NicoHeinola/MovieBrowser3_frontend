import type { WebsiteTag } from '@/interfaces/api/models/WebsiteTag';

/**
 * Creates a tag that exists only in the form until the website is saved. It gets a negative id so it can sit next to
 * saved tags without clashing.
 * @param name - The tag name.
 * @param pendingTags - The pending tags so far.
 * @returns The pending tag.
 */
export const createPendingWebsiteTag = (name: string, pendingTags: WebsiteTag[]): WebsiteTag => {
  const lowestId = Math.min(0, ...pendingTags.map((tag) => tag.id));

  return { id: lowestId - 1, name };
};
