import type { ChipsFilterValue } from '@/composables/search/ChipsFilterValue';

/** Filters the show search applies on top of the search term. */
export interface ShowSearchFilters {
  /** Whole show statuses to keep and to leave out: a status every entry shares, or `mixed` when entries differ. */
  watchStatus: ChipsFilterValue;
  /** Watch statuses of which a show needs at least one on any entry, and ones no entry may have. */
  entryWatchStatus: ChipsFilterValue;
  /** Category values a show must all have, and ones it must not have any of. */
  category: ChipsFilterValue;
  /** Whether to keep only shows that have a preview video. */
  hasPreview: boolean;
}
