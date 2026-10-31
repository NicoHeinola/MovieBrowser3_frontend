import type { ShowSearchFilters } from './ShowSearchFilters';
import type { ShowQueryKey } from '@/enums/query/showQueryKey';
import type { Show } from '@/interfaces/api/models/Show';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import { watchDebounced } from '@vueuse/core';
import { computed, ref, watch } from 'vue';

import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { showService } from '@/services/show/showService';
import { getShowSearchFilterParams } from '@/utils/show/getShowSearchFilterParams';

/**
 * Creates a filter set that filters nothing.
 * @returns The empty filters.
 */
const createEmptyFilters = (): ShowSearchFilters => ({
  categories: [],
  excludedCategories: [],
  watchStatuses: [],
  excludedWatchStatuses: [],
  hasPreview: false,
});

/**
 * Debounced, paginated show search shared by the search page and the admin shows page.
 *
 * @param queryKey Query key of the calling page, so each page keeps its own cache entry.
 * @returns The search input, filter and page refs, the query, and the derived results.
 */
export const useShowSearch = (queryKey: ShowQueryKey) => {
  const searchInput = ref<string>('');
  const searchTerm = ref<string>('');
  const filters = ref<ShowSearchFilters>(createEmptyFilters());
  const page = ref<number>(1);
  const isSearchPending = ref<boolean>(false);

  const searchQuery = useAPIQuery<PaginatedResponse<Show>>({
    queryKey: [queryKey, searchTerm, filters, page],
    queryFn: async () => {
      return await showService.list({
        filter: getShowSearchFilterParams(searchTerm.value, filters.value),
        sort: '-created_at',
        page: { number: page.value, size: 32 },
      });
    },
    placeholderData: (previousData) => previousData,
  });

  const shows = computed<Show[]>(() => searchQuery.data.value?.data ?? []);
  const totalPages = computed<number>(() => searchQuery.data.value?.meta.last_page ?? 1);
  const totalResults = computed<number>(() => searchQuery.data.value?.meta.total ?? 0);
  const isLoading = computed<boolean>(() => isSearchPending.value || searchQuery.isFetching.value);
  const activeFilterCount = computed<number>(
    () =>
      filters.value.categories.length +
      filters.value.excludedCategories.length +
      filters.value.watchStatuses.length +
      filters.value.excludedWatchStatuses.length +
      Number(filters.value.hasPreview),
  );

  /**
   * Resets every filter while keeping the search term.
   * @returns void
   */
  const clearFilters = (): void => {
    filters.value = createEmptyFilters();
  };

  watch(searchInput, (value) => {
    isSearchPending.value = (value ?? '').trim() !== searchTerm.value;
  });

  watchDebounced(
    searchInput,
    (value) => {
      searchTerm.value = (value ?? '').trim();
      page.value = 1;
      isSearchPending.value = false;
    },
    {
      debounce: 300,
    },
  );

  watch(
    filters,
    () => {
      page.value = 1;
    },
    { deep: true },
  );

  return {
    searchInput,
    filters,
    activeFilterCount,
    clearFilters,
    page,
    searchQuery,
    shows,
    totalPages,
    totalResults,
    isLoading,
  };
};
