import type { PaginatedSearchOptions } from './PaginatedSearchOptions';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import type { Ref } from 'vue';
import { watchDebounced } from '@vueuse/core';
import { computed, ref, watch } from 'vue';

import { useAPIQuery } from '@/composables/api/useAPIQuery';

/**
 * Debounced, paginated backend search with filters and sorting, shared by the searchable list pages. Changing the
 * search, filters or sort goes back to the first page, and a page past the last one steps back to the last.
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

  const query = useAPIQuery<PaginatedResponse<TItem>>({
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
  const totalPages = computed<number>(() => query.data.value?.meta.last_page ?? 1);
  const totalResults = computed<number>(() => query.data.value?.meta.total ?? 0);
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
      searchTerm.value = (value ?? '').trim();
      page.value = 1;
      isSearchPending.value = false;
    },
    {
      debounce: 300,
    },
  );

  watch(totalPages, (lastPage) => {
    /** Step back when removing the last item of the last page leaves it past the end. */
    if (page.value > lastPage) {
      page.value = lastPage;
    }
  });

  watch(
    [filters, sort],
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
    sort,
    page,
    query,
    items,
    totalPages,
    totalResults,
    isLoading,
  };
};
