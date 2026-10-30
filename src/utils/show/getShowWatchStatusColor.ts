import type { Show } from '@/interfaces/api/models/Show';
import { getShowWatchStatuses } from './getShowWatchStatuses';
import { getWatchStatusColor } from './getWatchStatusColor';

export const MIXED_WATCH_STATUS_COLOR = 'watch-status-mixed';

/**
 * Resolves the theme color that represents a whole show's watch progress.
 * @param show - The show whose entries are inspected.
 * @returns The status color when every entry shares one status, the mixed color when statuses differ or some entries have none, or null when no entry has a status.
 */
export const getShowWatchStatusColor = (show: Show): string | null => {
  const statuses = getShowWatchStatuses(show);
  if (statuses.size === 0) return null;

  const statusCount = [...statuses.values()].reduce((total, count) => total + count, 0);
  const [status] = [...statuses.keys()];
  if (statuses.size > 1 || statusCount < (show.entries?.length ?? 0)) return MIXED_WATCH_STATUS_COLOR;

  return getWatchStatusColor(status!);
};
