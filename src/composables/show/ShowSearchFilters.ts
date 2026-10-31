import type { WatchStatus } from '@/enums/show/WatchStatus';

/** Filters the show search applies on top of the search term. */
export interface ShowSearchFilters {
  /** Category values a show must all have. */
  categories: string[];
  /** Watch statuses of which a show needs at least one on any entry. */
  watchStatuses: WatchStatus[];
  /** Whether to keep only shows that have a preview video. */
  hasPreview: boolean;
}
