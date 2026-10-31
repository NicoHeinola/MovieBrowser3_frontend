import type { LocationQuery, LocationQueryRaw } from 'vue-router';

/** How a paginated search keeps its filters in the URL query. */
export interface PaginatedSearchRouteQuery<TFilters> {
  /** Sort values the URL may pick from. Any other value falls back to the default sort. */
  sortValues: string[];
  /** Writes the filters as query params, leaving out the ones that filter nothing. */
  getFiltersQuery: (filters: TFilters) => LocationQueryRaw;
  /** Reads the filters from the query, ignoring unknown values. */
  getFiltersFromQuery: (query: LocationQuery) => TFilters;
}
