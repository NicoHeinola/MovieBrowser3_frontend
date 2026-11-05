import type { ShowSearchFilters } from './ShowSearchFilters';
import type { ShowQueryKey } from '@/enums/query/showQueryKey';
import type { Show } from '@/interfaces/api/models/Show';

import { usePaginatedSearch } from '@/composables/search/usePaginatedSearch';
import { showService } from '@/services/show/showService';
import { createSearchFilters } from '@/utils/filter/createSearchFilters';
import { getShowGridLayout } from '@/utils/show/getShowGridLayout';
import { showSearchFilterDefinitions } from './showSearchFilterDefinitions';
import { showSortOptions } from './showSortOptions';

/**
 * Debounced, paginated show search shared by the search page and the admin shows page, kept in the URL query.
 *
 * @param queryKey Query key of the calling page, so each page keeps its own cache entry.
 * @param defaultFilters Filters applied until the user changes them. They count as active filters, and clearing the
 * filters removes them too.
 * @returns The search input, filter, sort and page refs, the query, the shows, the page size, and the style
 * that sizes their grid.
 */
export const useShowSearch = (queryKey: ShowQueryKey, defaultFilters: Partial<ShowSearchFilters> = {}) => {
  const { routeQuery, ...filterOptions } = createSearchFilters<ShowSearchFilters>(
    showSearchFilterDefinitions,
    'search',
    defaultFilters,
  );

  // Read once: the page size only has to fit the screen the page opens on. The window width is the one a scrollbar
  // does not change, so the grid does not depend on whether the results overflow the page.
  const { pageSize, width } = getShowGridLayout(window.innerWidth, window.innerHeight);

  const { items, ...search } = usePaginatedSearch<Show, ShowSearchFilters>({
    queryKey,
    list: showService.list,
    ...filterOptions,
    defaultSort: showSortOptions[0].value,
    pageSize,
    routeQuery: {
      ...routeQuery,
      sortValues: showSortOptions.map((option) => option.value),
    },
  });

  return {
    ...search,
    shows: items,
    pageSize,
    gridStyle: {
      width: `${width}px`,
      // Room for a scrollbar, which must not wrap the grid, while a window made smaller still wraps the cards.
      maxWidth: 'calc(100% + 32px)',
    },
  };
};
