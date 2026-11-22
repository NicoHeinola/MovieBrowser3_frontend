import type { UncountedPaginationMeta } from '../models/UncountedPaginationMeta';

/** A page of a list without a total count; `links.next` is null on the last page. */
export interface UncountedPaginatedResponse<T> {
  data: T[];
  links: {
    prev: string | null;
    next: string | null;
  };
  meta: UncountedPaginationMeta;
}
