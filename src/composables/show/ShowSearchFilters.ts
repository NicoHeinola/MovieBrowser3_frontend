import type { ChipsFilterValue } from '@/composables/search/ChipsFilterValue';

/** Filters the show search applies on top of the search term. */
export interface ShowSearchFilters {
  /** Watch statuses of which a show needs at least one on any entry, and ones no entry may have. */
  watchStatus: ChipsFilterValue;
  /** Category values a show must all have, and ones it must not have any of. */
  category: ChipsFilterValue;
  /** Whether to keep only shows that have a preview video. */
  hasPreview: boolean;
}
