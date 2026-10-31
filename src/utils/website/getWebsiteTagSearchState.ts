import type { WebsiteTag } from '@/interfaces/api/models/WebsiteTag';

/**
 * Describes what the tag autocomplete can offer for its search text. Matching ignores case and surrounding spaces,
 * like the backend's unique tag names.
 * @param search - The typed search text.
 * @param tags - Every tag the autocomplete lists, saved and pending.
 * @param selectedIds - Ids of the selected tags, which the list hides.
 * @returns The trimmed name, the tag with exactly that name, whether a new tag can be made from it, and whether the
 * list still shows any matching tag.
 */
export const getWebsiteTagSearchState = (
  search: string | null | undefined,
  tags: WebsiteTag[],
  selectedIds: number[],
): { name: string; exactMatch: WebsiteTag | undefined; canCreate: boolean; hasVisibleMatches: boolean } => {
  const name = (search ?? '').trim();
  const key = name.toLowerCase();
  const exactMatch = key ? tags.find((tag) => tag.name.toLowerCase() === key) : undefined;
  const hasVisibleMatches = tags.some((tag) => !selectedIds.includes(tag.id) && tag.name.toLowerCase().includes(key));

  return {
    name,
    exactMatch,
    canCreate: key !== '' && !exactMatch,
    hasVisibleMatches,
  };
};
