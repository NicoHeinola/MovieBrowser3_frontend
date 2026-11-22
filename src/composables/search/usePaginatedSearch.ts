import type { ApiQueryParams } from '@/interfaces/api/requests/ApiQueryParams';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import type { UncountedPaginatedResponse } from '@/interfaces/api/responses/UncountedPaginatedResponse';
import type { PaginatedSearchRouteQuery } from '@/interfaces/search/PaginatedSearchRouteQuery';
import type { PaginatedSearchState } from '@/interfaces/search/PaginatedSearchState';
import type { Ref } from 'vue';
import { watchDebounced } from '@vueuse/core';
import { computed, ref, watch } from 'vue';

import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { usePaginatedSearchRouteSync } from './usePaginatedSearchRouteSync';

/** What a paginated search needs to know about its domain. */
export interface PaginatedSearchOptions<TItem, TFilters> {
  /** Query key of the calling page, so each page keeps its own cache entry. */
  queryKey: string;
  /** Fetches one page of results, with a total count or, for a backend that doesn't count, only a next link. */
  list: (query: ApiQueryParams) => Promise<PaginatedResponse<TItem> | UncountedPaginatedResponse<TItem>>;
  /** Creates a filter set that filters nothing. */
  createEmptyFilters: () => TFilters;
  /** Builds the backend `filter` params from the trimmed search term and the filters. */
  getFilterParams: (searchTerm: string, filters: TFilters) => Record<string, string | string[]> | undefined;
  /** Counts the active filters, for the filter button badge. */
  countActiveFilters: (filters: TFilters) => number;
  /** Backend sort value to start with, such as `-created_at`. */
  defaultSort: string;
  pageSize: number;
  /** The deepest page the backend serves, for a backend that limits it; a URL asking for more gets this one. */
  maxPage?: number;
  /** Keeps the search in the URL query when set. Only one search per page may use it. */
  routeQuery?: PaginatedSearchRouteQuery<TFilters>;
}

/**
 * Tells a page with a total count from one that only links to the next page.
 * @param response - One page of results.
 * @returns Whether the page carries `last_page` and `total`.
 */
const isCountedPage = <TItem>(
  response: PaginatedResponse<TItem> | UncountedPaginatedResponse<TItem>,
): response is PaginatedResponse<TItem> => 'total' in response.meta;

/**
 * Debounced, paginated backend search with filters and sorting, shared by the searchable list pages. Changing the
 * search, filters or sort goes back to the first page, and a page past the last one steps back to the last. With
 * `routeQuery` set, the search is kept in the URL query (see `usePaginatedSearchRouteSync`).
 *
 * @param options - The domain's query key, list call, filters and paging.
 * @returns The search input, filter, sort and page refs, the query, and the derived results.
 */
export const usePaginatedSearch = <TItem, TFilters>(options: PaginatedSearchOptions<TItem, TFilters>) => {
  const searchInput = ref<string>('');
  const searchTerm = ref<string>('');
  const filters = ref(options.createEmptyFilters()) as Ref<TFilters>;
  const sort = ref<string>(options.defaultSort);
  const page = ref<number>(1);
  const isSearchPending = ref<boolean>(false);

  /**
   * Serializes the filters and sort the current page belongs to.
   * @returns The page scope key.
   */
  const getPageScope = (): string => JSON.stringify([filters.value, sort.value]);

  /** Filters and sort of the current page; changing them goes back to the first page. */
  let pageScope = getPageScope();

  /** The committed search state, without a search term that is still being typed. */
  const state = computed<PaginatedSearchState<TFilters>>(() => ({
    search: searchTerm.value,
    filters: filters.value,
    sort: sort.value,
    page: page.value,
  }));

  /**
   * Replaces the whole search state, keeping its page instead of going back to the first one.
   * @param nextState - The new search state.
   * @returns void
   */
  const setState = (nextState: PaginatedSearchState<TFilters>): void => {
    searchInput.value = nextState.search;
    searchTerm.value = nextState.search;
    filters.value = nextState.filters;
    sort.value = nextState.sort;
    page.value = Math.min(nextState.page, options.maxPage ?? Infinity);
    pageScope = getPageScope();
  };

  if (options.routeQuery) {
    usePaginatedSearchRouteSync(state, setState, options.routeQuery, options.defaultSort);
  }

  const query = useAPIQuery<PaginatedResponse<TItem> | UncountedPaginatedResponse<TItem>>({
    queryKey: [options.queryKey, searchTerm, filters, sort, page],
    queryFn: async () => {
      return await options.list({
        filter: options.getFilterParams(searchTerm.value, filters.value),
        sort: sort.value,
        page: { number: page.value, size: options.pageSize },
      });
    },
    placeholderData: (previousData) => previousData,
  });

  const items = computed<TItem[]>(() => query.data.value?.data ?? []);
  const totalPages = computed<number>(() => {
    const response = query.data.value;
    if (!response) {
      return 1;
    }

    // Without a count, the pages known so far run up to the next one, when there is one.
    return isCountedPage(response)
      ? response.meta.last_page
      : response.meta.current_page + (response.links.next ? 1 : 0);
  });
  /** All results over every page; 0 for a backend that doesn't count them. */
  const totalResults = computed<number>(() => {
    const response = query.data.value;
    return response && isCountedPage(response) ? response.meta.total : 0;
  });
  const isLoading = computed<boolean>(() => isSearchPending.value || query.isFetching.value);
  const activeFilterCount = computed<number>(() => options.countActiveFilters(filters.value));

  /**
   * Resets every filter while keeping the search term.
   * @returns void
   */
  const clearFilters = (): void => {
    filters.value = options.createEmptyFilters();
  };

  watch(searchInput, (value) => {
    isSearchPending.value = (value ?? '').trim() !== searchTerm.value;
  });

  watchDebounced(
    searchInput,
    (value) => {
      const term = (value ?? '').trim();
      isSearchPending.value = false;

      // A state restored from the URL already set the term and its page.
      if (term === searchTerm.value) {
        return;
      }

      searchTerm.value = term;
      page.value = 1;
    },
    {
      debounce: 300,
    },
  );

  watch(totalPages, (lastPage) => {
    // Step back when removing the last item of the last page leaves it past the end.
    if (page.value > lastPage) {
      page.value = lastPage;
    }
  });

  watch(
    [filters, sort],
    () => {
      const scope = getPageScope();
      if (scope === pageScope) {
        return;
      }

      pageScope = scope;
      page.value = 1;
    },
    { deep: true },
  );

  return {
    searchInput,
    /** The trimmed search term the results belong to, which follows `searchInput` after the debounce. */
    searchTerm,
    filters,
    activeFilterCount,
    clearFilters,
    sort,
    page,
    query,
    items,
    totalPages,
    totalResults,
    isLoading,
  };
};
