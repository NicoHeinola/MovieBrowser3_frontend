import type { PaginatedSearchRouteQuery } from './PaginatedSearchRouteQuery';
import type { PaginatedSearchState } from './PaginatedSearchState';
import type { ComputedRef } from 'vue';
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getPaginatedSearchQuery } from '@/utils/search/getPaginatedSearchQuery';
import { getPaginatedSearchStateFromQuery } from '@/utils/search/getPaginatedSearchStateFromQuery';

/**
 * Keeps a paginated search in the URL query. Applies the query right away, follows later changes to it while the page
 * stays open, and writes the search's own changes back with `router.replace`. Call it before the search query is
 * created, so the first request already uses the URL state.
 *
 * @param state - The committed search state.
 * @param setState - Replaces the whole search state, keeping its page.
 * @param routeQuery - How the domain reads and writes its filters, and which sorts it allows.
 * @param defaultSort - The sort the search starts with, left out of the URL.
 * @returns void
 */
export const usePaginatedSearchRouteSync = <TFilters>(
  state: ComputedRef<PaginatedSearchState<TFilters>>,
  setState: (nextState: PaginatedSearchState<TFilters>) => void,
  routeQuery: PaginatedSearchRouteQuery<TFilters>,
  defaultSort: string,
): void => {
  const route = useRoute();
  const router = useRouter();
  const routeName = route.name;

  /**
   * Builds the route query of a search state.
   * @param searchState - The search state.
   * @returns The query, serialized for comparison.
   */
  const getQueryKey = (searchState: PaginatedSearchState<TFilters>): string =>
    JSON.stringify(getPaginatedSearchQuery(searchState, routeQuery, defaultSort));

  /**
   * Reads the search state from the current route query.
   * @returns The search state.
   */
  const getRouteState = (): PaginatedSearchState<TFilters> =>
    getPaginatedSearchStateFromQuery(route.query, routeQuery, defaultSort);

  setState(getRouteState());

  watch(
    () => route.query,
    () => {
      // Leaving the page also changes the query; that is not a new search.
      if (route.name !== routeName) {
        return;
      }

      const routeState = getRouteState();
      if (getQueryKey(routeState) !== getQueryKey(state.value)) {
        setState(routeState);
      }
    },
  );

  watch(
    state,
    (searchState) => {
      if (route.name !== routeName || getQueryKey(searchState) === getQueryKey(getRouteState())) {
        return;
      }

      void router.replace({ query: getPaginatedSearchQuery(searchState, routeQuery, defaultSort) });
    },
    { deep: true },
  );
};
