import type { WatchStatus } from '@/enums/show/WatchStatus';

/** Filters the show search applies on top of the search term. */
export interface ShowSearchFilters {
  /** Category values a show must all have. */
  categories: string[];
  /** Category values a show must not have any of. */
  excludedCategories: string[];
  /** Watch statuses of which a show needs at least one on any entry. */
  watchStatuses: WatchStatus[];
  /** Watch statuses no entry of a show may have. */
  excludedWatchStatuses: WatchStatus[];
  /** Whether to keep only shows that have a preview video. */
  hasPreview: boolean;
}
