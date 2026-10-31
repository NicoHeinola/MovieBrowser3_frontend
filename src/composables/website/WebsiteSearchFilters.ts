/** Filters the website search applies on top of the search term. */
export interface WebsiteSearchFilters {
  /** Tag ids a website must all have. */
  tagIds: number[];
  /** Tag ids a website must not have any of. */
  excludedTagIds: number[];
}
