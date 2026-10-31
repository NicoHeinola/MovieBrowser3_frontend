import type { WebsiteSearchFilters } from '@/composables/website/WebsiteSearchFilters';
import type { LocationQueryRaw } from 'vue-router';

/**
 * Writes the website search filters as URL query params. Multiple values repeat the param.
 * @param filters - The selected tag filters.
 * @returns The query params of the filters that are set.
 */
export const getWebsiteSearchFiltersQuery = (filters: WebsiteSearchFilters): LocationQueryRaw => {
  const query: LocationQueryRaw = {};

  if (filters.tagIds.length > 0) {
    query.tag = filters.tagIds.map(String);
  }

  if (filters.excludedTagIds.length > 0) {
    query.exclude_tag = filters.excludedTagIds.map(String);
  }

  return query;
};
