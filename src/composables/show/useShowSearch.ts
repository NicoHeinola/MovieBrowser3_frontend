import type { ShowSearchFilters } from './ShowSearchFilters';
import type { ShowQueryKey } from '@/enums/query/showQueryKey';
import type { Show } from '@/interfaces/api/models/Show';

import { usePaginatedSearch } from '@/composables/search/usePaginatedSearch';
import { showService } from '@/services/show/showService';
import { getShowSearchFilterParams } from '@/utils/show/getShowSearchFilterParams';
import { showSortOptions } from './showSortOptions';

/**
 * Debounced, paginated show search shared by the search page and the admin shows page.
 *
 * @param queryKey Query key of the calling page, so each page keeps its own cache entry.
 * @returns The search input, filter, sort and page refs, the query, and the shows.
 */
export const useShowSearch = (queryKey: ShowQueryKey) => {
  const { items, ...search } = usePaginatedSearch<Show, ShowSearchFilters>({
    queryKey,
    list: showService.list,
    createEmptyFilters: () => ({
      categories: [],
      excludedCategories: [],
      watchStatuses: [],
      excludedWatchStatuses: [],
      hasPreview: false,
    }),
    getFilterParams: getShowSearchFilterParams,
    countActiveFilters: (filters) =>
      filters.categories.length +
      filters.excludedCategories.length +
      filters.watchStatuses.length +
      filters.excludedWatchStatuses.length +
      Number(filters.hasPreview),
    defaultSort: showSortOptions[0].value,
    pageSize: 32,
  });

  return {
    ...search,
    shows: items,
  };
};
