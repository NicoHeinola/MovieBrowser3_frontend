import type { WatchStatus } from '@/enums/show/WatchStatus';
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';

/**
 * Collects the unique watch statuses across show entries.
 * @param entries - The entries to inspect.
 * @returns A map of each distinct watch status to the number of entries that have it.
 */
export const getEntryWatchStatuses = (
  entries: Pick<ShowEntry, 'watch_status'>[] | null | undefined,
): Map<WatchStatus, number> => {
  const statuses = new Map<WatchStatus, number>();

  for (const entry of entries ?? []) {
    const status = entry.watch_status?.status;
    if (!status) continue;

    statuses.set(status, (statuses.get(status) ?? 0) + 1);
  }

  return statuses;
};
