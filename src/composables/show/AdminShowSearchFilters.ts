import type { ShowSearchFilters } from './ShowSearchFilters';

/** Filters of the admin shows page: the show search's, plus the ones that find episodes without a video file. */
export interface AdminShowSearchFilters extends ShowSearchFilters {
  /** Whether to keep only shows with an episode that has no playable video file, lost from disk or never uploaded. */
  hasMissingVideoFile: boolean;
  /** Whether to keep only shows with an episode whose uploaded video file has gone missing from disk. */
  hasLostVideoFile: boolean;
}
