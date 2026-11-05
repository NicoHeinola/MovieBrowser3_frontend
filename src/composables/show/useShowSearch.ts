import type { ShowSearchFilters } from './ShowSearchFilters';
import type { ShowQueryKey } from '@/enums/query/showQueryKey';
import type { Show } from '@/interfaces/api/models/Show';

import { usePaginatedSearch } from '@/composables/search/usePaginatedSearch';
import { showService } from '@/services/show/showService';
import { createSearchFilters } from '@/utils/filter/createSearchFilters';
import { showSearchFilterDefinitions } from './showSearchFilterDefinitions';
import { showSortOptions } from './showSortOptions';

/**
 * Debounced, paginated show search shared by the search page and the admin shows page, kept in the URL query.
 *
 * @param queryKey Query key of the calling page, so each page keeps its own cache entry.
 * @param defaultFilters Filters applied until the user changes them. They count as active filters, and clearing the
 * filters removes them too.
 * @returns The search input, filter, sort and page refs, the query, and the shows.
 */
export const useShowSearch = (queryKey: ShowQueryKey, defaultFilters: Partial<ShowSearchFilters> = {}) => {
  const { routeQuery, ...filterOptions } = createSearchFilters<ShowSearchFilters>(
    showSearchFilterDefinitions,
    'search',
    defaultFilters,
  );

  const { items, ...search } = usePaginatedSearch<Show, ShowSearchFilters>({
    queryKey,
    list: showService.list,
    ...filterOptions,
    defaultSort: showSortOptions[0].value,
    pageSize: 32,
    routeQuery: {
      ...routeQuery,
      sortValues: showSortOptions.map((option) => option.value),
    },
  });

  return {
    ...search,
    shows: items,
  };
};
