import type { ChipsFilterValue } from '@/composables/search/ChipsFilterValue';

/** Filters the website search applies on top of the search term. */
export interface WebsiteSearchFilters {
  /** Tag ids a website must all have, and ones it must not have any of. */
  tag: ChipsFilterValue;
}
