import type { WatchStatus } from '@/enums/show/WatchStatus';
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import { getEntryWatchStatuses } from './getEntryWatchStatuses';

export const MIXED_WATCH_STATUS = 'mixed';

export type CombinedWatchStatus = WatchStatus | typeof MIXED_WATCH_STATUS | null;

/**
 * Combines the watch statuses of several entries into one.
 * @param entries - The entries to combine.
 * @returns The shared status when every entry has the same one, `mixed` when statuses differ or only some entries have one, or null when no entry has a status.
 */
export const getCombinedWatchStatus = (
  entries: Pick<ShowEntry, 'watch_status'>[] | null | undefined,
): CombinedWatchStatus => {
  const statuses = getEntryWatchStatuses(entries);
  if (statuses.size === 0) return null;

  const [[status, count]] = statuses;
  if (statuses.size > 1 || count < (entries?.length ?? 0)) return MIXED_WATCH_STATUS;

  return status;
};
