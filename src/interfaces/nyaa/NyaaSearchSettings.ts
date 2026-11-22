import type { NyaaSearchFilters } from './NyaaSearchFilters';

/** What the nyaa search remembers between visits: everything but the search term. */
export interface NyaaSearchSettings {
  /** Host of the picked mirror. */
  mirror: string;
  /** nyaa sort field, with a leading `-` for descending, such as `-size`. */
  sort: string;
  filters: NyaaSearchFilters;
}
