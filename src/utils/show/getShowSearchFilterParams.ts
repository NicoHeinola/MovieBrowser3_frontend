import type { ShowSearchFilters } from '@/composables/show/ShowSearchFilters';

/**
 * Builds the backend `filter` query params for a show search. Multiple values go as arrays because the backend
 * matches commas literally.
 * @param searchTerm - The trimmed search term, or an empty string for none.
 * @param filters - The selected search filters.
 * @returns The filter params, or undefined when nothing filters the search.
 */
export const getShowSearchFilterParams = (
  searchTerm: string,
  filters: ShowSearchFilters,
): Record<string, string | string[]> | undefined => {
  const params: Record<string, string | string[]> = {};

  if (searchTerm) {
    params.search = searchTerm;
  }

  if (filters.categories.length > 0) {
    params['categories.value'] = filters.categories;
  }

  if (filters.excludedCategories.length > 0) {
    params.exclude_categories = filters.excludedCategories;
  }

  if (filters.watchStatuses.length > 0) {
    params.watch_status = filters.watchStatuses;
  }

  if (filters.excludedWatchStatuses.length > 0) {
    params.exclude_watch_status = filters.excludedWatchStatuses;
  }

  if (filters.hasPreview) {
    params.preview_url = 'not_null';
  }

  return Object.keys(params).length > 0 ? params : undefined;
};
