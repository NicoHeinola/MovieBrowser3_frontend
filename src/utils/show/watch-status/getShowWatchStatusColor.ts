import type { Show } from '@/interfaces/api/models/Show';
import { getCombinedWatchStatus } from './getCombinedWatchStatus';
import { MIXED_WATCH_STATUS } from './mixedWatchStatus';
import { WATCH_STATUS_STYLES } from './watchStatusStyles';

/**
 * Resolves the theme color that represents a whole show's watch progress.
 * @param show - The show whose entries are inspected.
 * @returns The shared status color, the mixed color when statuses differ or only some entries have one, or null when no entry has a status.
 */
export const getShowWatchStatusColor = (show: Show): string | null => {
  const status = getCombinedWatchStatus(show.entries);
  if (!status) return null;
  if (status === MIXED_WATCH_STATUS.value) return MIXED_WATCH_STATUS.color;

  return WATCH_STATUS_STYLES[status].color;
};
