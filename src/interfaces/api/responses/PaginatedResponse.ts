import type { PaginationMeta } from '../models/PaginationMeta';

/** A page of a list the backend counts, with `meta.total` and `meta.last_page`; see `UncountedPaginatedResponse`. */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
