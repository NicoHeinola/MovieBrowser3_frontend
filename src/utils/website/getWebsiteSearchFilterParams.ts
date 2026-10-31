import type { WebsiteSearchFilters } from '@/composables/website/WebsiteSearchFilters';

/**
 * Builds the backend `filter` query params for a website search. Multiple values go as arrays because the backend
 * matches commas literally.
 * @param searchTerm - The trimmed search term, or an empty string for none.
 * @param filters - The selected tag filters.
 * @returns The filter params, or undefined when nothing filters the search.
 */
export const getWebsiteSearchFilterParams = (
  searchTerm: string,
  filters: WebsiteSearchFilters,
): Record<string, string | string[]> | undefined => {
  const params: Record<string, string | string[]> = {};

  if (searchTerm) {
    params.search = searchTerm;
  }

  if (filters.tagIds.length > 0) {
    params['tags.id'] = filters.tagIds.map(String);
  }

  if (filters.excludedTagIds.length > 0) {
    params.exclude_tags = filters.excludedTagIds.map(String);
  }

  return Object.keys(params).length > 0 ? params : undefined;
};
