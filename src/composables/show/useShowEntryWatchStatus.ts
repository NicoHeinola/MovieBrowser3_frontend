import type { WatchStatus } from '@/enums/show/WatchStatus';
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import type { ShowEntryWatchStatus } from '@/interfaces/api/models/ShowEntryWatchStatus';
import { useQueryClient } from '@tanstack/vue-query';

import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { showEntryWatchStatusService } from '@/services/show/showEntryWatchStatusService';
import { setShowEntryWatchStatus } from '@/utils/show/setShowEntryWatchStatus';

/** Cached show lists that render watch statuses and must reflect a change without refetching. */
const showListQueryKeys = [ShowQueryKey.HomeShows, ShowQueryKey.SearchShows];

/**
 * Saves show entry watch statuses and mirrors them onto the cached show lists.
 * @returns The save function.
 */
export const useShowEntryWatchStatus = () => {
  const queryClient = useQueryClient();

  /**
   * Persists a watch status for an entry and patches every cached show list that contains it.
   * The entry itself is not mutated, since it may be a readonly object from the query cache.
   * @param entry - The entry to update.
   * @param status - The new watch status, or null to clear it.
   * @returns The saved watch status, or null when it was cleared.
   */
  const saveWatchStatus = async (
    entry: Pick<ShowEntry, 'id' | 'show_id'>,
    status: WatchStatus | null,
  ): Promise<ShowEntryWatchStatus | null> => {
    let watchStatus: ShowEntryWatchStatus | null = null;

    if (status) {
      await showEntryWatchStatusService.update(entry.id, { status });
      watchStatus = { show_entry_id: entry.id, status };
    } else {
      await showEntryWatchStatusService.remove(entry.id);
    }

    for (const queryKey of showListQueryKeys) {
      queryClient.setQueriesData({ queryKey: [queryKey] }, (data: unknown) =>
        setShowEntryWatchStatus(data, entry.show_id, entry.id, watchStatus),
      );
    }

    return watchStatus;
  };

  return {
    saveWatchStatus,
  };
};
