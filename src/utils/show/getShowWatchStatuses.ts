import type { WatchStatus } from '@/enums/show/WatchStatus';
import type { Show } from '@/interfaces/api/models/Show';

/**
 * Collects the unique watch statuses across a show's entries.
 * @param show - The show whose entries are inspected.
 * @returns A map of each distinct watch status to the number of entries that have it.
 */
export const getShowWatchStatuses = (show: Show): Map<WatchStatus, number> => {
  const statuses = new Map<WatchStatus, number>();

  for (const entry of show.entries ?? []) {
    const status = entry.watch_status?.status;
    if (!status) continue;

    statuses.set(status, (statuses.get(status) ?? 0) + 1);
  }

  return statuses;
};
