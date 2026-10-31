import type { Show } from '@/interfaces/api/models/Show';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import type { LocationQueryRaw } from 'vue-router';
import { refDebounced } from '@vueuse/core';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { showSortOptions } from '@/composables/show/showSortOptions';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { showService } from '@/services/show/showService';

/** How many matching shows the menu lists before pointing to the search page. */
const suggestionCount = 8;

/**
 * Debounced show suggestions for the navigation search, plus the jump to the full search page.
 * @returns The search input, its trimmed term, the suggested shows, the total match count, the loading state and
 * `openSearchPage`.
 */
export const useShowSearchMenu = () => {
  const search = ref<string>('');
  const debouncedSearch = refDebounced(search, 300);

  const route = useRoute();
  const router = useRouter();

  const term = computed<string>(() => (search.value ?? '').trim());
  const debouncedTerm = computed<string>(() => (debouncedSearch.value ?? '').trim());

  const showsQuery = useAPIQuery<PaginatedResponse<Show>>({
    queryKey: [ShowQueryKey.NavigationSearchShows, debouncedTerm],
    queryFn: async () => {
      return await showService.list({
        filter: { search: debouncedTerm.value },
        sort: showSortOptions[0].value,
        page: { number: 1, size: suggestionCount },
      });
    },
    enabled: computed<boolean>(() => debouncedTerm.value !== ''),
    placeholderData: (previousData) => previousData,
  });

  const shows = computed<Show[]>(() => showsQuery.data.value?.data ?? []);
  const totalResults = computed<number>(() => showsQuery.data.value?.meta.total ?? 0);
  const isLoading = computed<boolean>(() => term.value !== debouncedTerm.value || showsQuery.isFetching.value);

  /**
   * Opens the search page with the typed term and clears the field. Already on the search page, its filters and sort
   * stay and only the term and page change, and an empty field leaves the page's search alone.
   * @returns void
   */
  const openSearchPage = async (): Promise<void> => {
    const isOnSearchPage = route.name === 'authenticated-search';
    if (isOnSearchPage && !term.value) {
      return;
    }

    const query: LocationQueryRaw = {
      ...(isOnSearchPage ? route.query : {}),
      q: term.value || undefined,
      page: undefined,
    };

    search.value = '';
    await router.push({ name: 'authenticated-search', query });
  };

  return {
    search,
    term,
    shows,
    totalResults,
    isLoading,
    openSearchPage,
  };
};
