import type { NekoBtTorrent } from '@/interfaces/api/models/NekoBtTorrent';
import type { NekoBtSearchFilters } from '@/interfaces/nekobt/NekoBtSearchFilters';

import { usePaginatedSearch } from '@/composables/search/usePaginatedSearch';
import { NEKOBT_MAX_PAGE } from '@/data/nekobt/nekoBtMaxPage';
import { nekoBtSearchFilterDefinitions } from '@/data/nekobt/nekoBtSearchFilterDefinitions';
import { nekoBtSortValues } from '@/data/nekobt/nekoBtSortValues';
import { NekoBtQueryKey } from '@/enums/query/nekoBtQueryKey';
import { nekoBtTorrentService } from '@/services/nekobt/nekoBtTorrentService';
import { createSearchFilters } from '@/utils/filter/createSearchFilters';

/**
 * Debounced, paginated nekoBT search for the admin torrents page, with its filters, kept in the URL query.
 *
 * @returns The search input, filter, sort and page refs, the query and the torrents.
 */
export const useNekoBtTorrentSearch = () => {
  const { routeQuery, ...filterOptions } = createSearchFilters<NekoBtSearchFilters>(
    nekoBtSearchFilterDefinitions,
    'search',
  );

  const { items, ...search } = usePaginatedSearch<NekoBtTorrent, NekoBtSearchFilters>({
    queryKey: NekoBtQueryKey.AdminTorrents,
    list: nekoBtTorrentService.list,
    ...filterOptions,
    // Biggest first finds whole seasons fastest
    defaultSort: '-size',
    // The site sets the page size; this only keys the request
    pageSize: 50,
    maxPage: NEKOBT_MAX_PAGE,
    routeQuery: {
      ...routeQuery,
      sortValues: nekoBtSortValues,
    },
  });

  return {
    ...search,
    torrents: items,
  };
};
