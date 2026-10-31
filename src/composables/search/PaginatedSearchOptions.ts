import type { ApiQueryParams } from '@/interfaces/api/requests/ApiQueryParams';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

/** What a paginated search needs to know about its domain. */
export interface PaginatedSearchOptions<TItem, TFilters> {
  /** Query key of the calling page, so each page keeps its own cache entry. */
  queryKey: string;
  /** Fetches one page of results. */
  list: (query: ApiQueryParams) => Promise<PaginatedResponse<TItem>>;
  /** Creates a filter set that filters nothing. */
  createEmptyFilters: () => TFilters;
  /** Builds the backend `filter` params from the trimmed search term and the filters. */
  getFilterParams: (searchTerm: string, filters: TFilters) => Record<string, string | string[]> | undefined;
  /** Counts the active filters, for the filter button badge. */
  countActiveFilters: (filters: TFilters) => number;
  /** Backend sort value to start with, such as `-created_at`. */
  defaultSort: string;
  pageSize: number;
}
