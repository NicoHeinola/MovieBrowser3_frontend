import type { ShowEntryWatchStatus } from '@/interfaces/api/models/ShowEntryWatchStatus';

import { updateCachedObjects } from '@/utils/query/updateCachedObjects';

/**
 * Rewrites the watch status of one show entry anywhere inside cached query data, whatever its shape.
 * A show matches when its id and one of its entries match, and only the objects along the changed path are copied,
 * so untouched shows keep their references.
 * @param data - Cached query data that may contain shows, such as a list, a paginated response or a map of lists.
 * @param showId - The id of the show that owns the entry.
 * @param entryId - The id of the entry to update.
 * @param watchStatus - The new watch status, or null to clear it.
 * @returns The updated data, or the same reference when no show matched.
 */
export const setShowEntryWatchStatus = <T>(
  data: T,
  showId: number,
  entryId: number,
  watchStatus: ShowEntryWatchStatus | null,
): T =>
  updateCachedObjects(data, (record) => {
    const entries = record.entries as { id: number; show_id: number }[] | undefined;
    const isOwner =
      record.id === showId &&
      Array.isArray(entries) &&
      entries.some((entry) => entry.id === entryId && entry.show_id === showId);

    if (!isOwner) {
      return record;
    }

    return {
      ...record,
      entries: entries.map((entry) => (entry.id === entryId ? { ...entry, watch_status: watchStatus } : entry)),
    };
  });
