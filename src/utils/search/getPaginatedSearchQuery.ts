import type { PaginatedSearchRouteQuery } from '@/composables/search/PaginatedSearchRouteQuery';
import type { PaginatedSearchState } from '@/composables/search/PaginatedSearchState';
import type { LocationQueryRaw } from 'vue-router';

/**
 * Builds the URL query for a paginated search. Defaults are left out, so an untouched search has an empty query.
 * @param state - The search state.
 * @param routeQuery - How the domain writes its filters.
 * @param defaultSort - The sort the search starts with.
 * @returns The route query.
 */
export const getPaginatedSearchQuery = <TFilters>(
  state: PaginatedSearchState<TFilters>,
  routeQuery: PaginatedSearchRouteQuery<TFilters>,
  defaultSort: string,
): LocationQueryRaw => {
  const query: LocationQueryRaw = {};

  if (state.search) {
    query.q = state.search;
  }

  Object.assign(query, routeQuery.getFiltersQuery(state.filters));

  if (state.sort !== defaultSort) {
    query.sort = state.sort;
  }

  if (state.page > 1) {
    query.page = String(state.page);
  }

  return query;
};
