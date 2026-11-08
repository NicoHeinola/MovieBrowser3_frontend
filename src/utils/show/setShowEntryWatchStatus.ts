import type { ShowEntryWatchStatus } from '@/interfaces/api/models/ShowEntryWatchStatus';

import { updateCachedObjects } from '@/utils/query/updateCachedObjects';
import { ownsShowEntry } from '@/utils/show/ownsShowEntry';

/**
 * Rewrites the watch status of one show entry anywhere inside cached query data, whatever its shape.
 * Only the objects along the changed path are copied, so untouched shows keep their references, and an entry that
 * already has the status is left as it is.
 * @param data - Cached query data that may contain shows, such as a list, a paginated response or a map of lists.
 * @param showId - The id of the show that owns the entry.
 * @param entryId - The id of the entry to update.
 * @param watchStatus - The new watch status, or null to clear it.
 * @returns The updated data, or the same reference when no show matched or the entry already had the status.
 */
export const setShowEntryWatchStatus = <T>(
  data: T,
  showId: number,
  entryId: number,
  watchStatus: ShowEntryWatchStatus | null,
): T =>
  updateCachedObjects(data, (record) => {
    if (!ownsShowEntry(record, showId, entryId)) {
      return record;
    }

    const entries = record.entries as { id: number; watch_status?: ShowEntryWatchStatus | null }[];
    const entry = entries.find((item) => item.id === entryId);

    // Same status already, such as the stream echoing a save made here: keep the reference so nothing re-renders.
    if ((entry?.watch_status?.status ?? null) === (watchStatus?.status ?? null)) {
      return record;
    }

    return {
      ...record,
      entries: entries.map((item) => (item.id === entryId ? { ...item, watch_status: watchStatus } : item)),
    };
  });
