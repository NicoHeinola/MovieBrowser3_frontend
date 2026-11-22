/** Paging of a list the backend doesn't count: it says only whether another page follows, not how many there are. */
export interface UncountedPaginationMeta {
  current_page: number;
  per_page: number;
  /** Position of the page's first item, or null for an empty page. */
  from: number | null;
  /** Position of the page's last item, or null for an empty page. */
  to: number | null;
}
