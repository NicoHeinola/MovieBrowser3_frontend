/** The part of a paginated search that the URL query keeps. */
export interface PaginatedSearchState<TFilters> {
  /** Trimmed search term, or an empty string for none. */
  search: string;
  filters: TFilters;
  /** Backend sort value, such as `-created_at`. */
  sort: string;
  /** One-based page number. */
  page: number;
}
