import type { ShowSearchFilters } from '@/composables/show/ShowSearchFilters';
import type { LocationQueryRaw } from 'vue-router';

/**
 * Writes the show search filters as URL query params. Multiple values repeat the param.
 * @param filters - The selected search filters.
 * @returns The query params of the filters that are set.
 */
export const getShowSearchFiltersQuery = (filters: ShowSearchFilters): LocationQueryRaw => {
  const query: LocationQueryRaw = {};

  if (filters.categories.length > 0) {
    query.category = filters.categories;
  }

  if (filters.excludedCategories.length > 0) {
    query.exclude_category = filters.excludedCategories;
  }

  if (filters.watchStatuses.length > 0) {
    query.watch_status = filters.watchStatuses;
  }

  if (filters.excludedWatchStatuses.length > 0) {
    query.exclude_watch_status = filters.excludedWatchStatuses;
  }

  if (filters.hasPreview) {
    query.has_preview = 'true';
  }

  return query;
};
