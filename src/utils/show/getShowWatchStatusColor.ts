import type { Show } from '@/interfaces/api/models/Show';
import { getCombinedWatchStatus } from './getCombinedWatchStatus';
import { getWatchStatusColor } from './getWatchStatusColor';
import { MIXED_WATCH_STATUS } from './mixedWatchStatus';

/**
 * Resolves the theme color that represents a whole show's watch progress.
 * @param show - The show whose entries are inspected.
 * @returns The shared status color, the mixed color when statuses differ or only some entries have one, or null when no entry has a status.
 */
export const getShowWatchStatusColor = (show: Show): string | null => {
  const status = getCombinedWatchStatus(show.entries);
  if (!status) return null;
  if (status === MIXED_WATCH_STATUS.value) return MIXED_WATCH_STATUS.color;

  return getWatchStatusColor(status);
};
