import type { PaginatedSearchRouteQuery } from '@/composables/search/PaginatedSearchRouteQuery';
import type { PaginatedSearchState } from '@/composables/search/PaginatedSearchState';
import type { LocationQuery } from 'vue-router';

import { getQueryString } from '@/utils/route/getQueryString';

/**
 * Reads a paginated search from the URL query. Missing or invalid params fall back to the defaults.
 * @param query - The route query.
 * @param routeQuery - How the domain reads its filters and which sorts it allows.
 * @param defaultSort - The sort to use when the query has none or an unknown one.
 * @returns The search state.
 */
export const getPaginatedSearchStateFromQuery = <TFilters>(
  query: LocationQuery,
  routeQuery: PaginatedSearchRouteQuery<TFilters>,
  defaultSort: string,
): PaginatedSearchState<TFilters> => {
  const sort = getQueryString(query.sort);
  const page = Number(getQueryString(query.page));

  return {
    search: getQueryString(query.q)?.trim() ?? '',
    filters: routeQuery.getFiltersFromQuery(query),
    sort: sort && routeQuery.sortValues.includes(sort) ? sort : defaultSort,
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
};
