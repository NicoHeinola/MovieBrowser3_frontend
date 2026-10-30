import type { Show } from '@/interfaces/api/models/Show';
import { getCombinedWatchStatus, MIXED_WATCH_STATUS } from './getCombinedWatchStatus';
import { getWatchStatusColor } from './getWatchStatusColor';

export const MIXED_WATCH_STATUS_COLOR = 'watch-status-mixed';

/**
 * Resolves the theme color that represents a whole show's watch progress.
 * @param show - The show whose entries are inspected.
 * @returns The shared status color, the mixed color when statuses differ or only some entries have one, or null when no entry has a status.
 */
export const getShowWatchStatusColor = (show: Show): string | null => {
  const status = getCombinedWatchStatus(show.entries);
  if (!status) return null;
  if (status === MIXED_WATCH_STATUS) return MIXED_WATCH_STATUS_COLOR;

  return getWatchStatusColor(status);
};
