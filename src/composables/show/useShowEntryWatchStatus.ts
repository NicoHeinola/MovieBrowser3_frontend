import type { WatchStatus } from '@/enums/show/WatchStatus';
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';
import type { ShowEntryWatchStatus } from '@/interfaces/api/models/ShowEntryWatchStatus';
import { useQueryClient } from '@tanstack/vue-query';

import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { showEntryWatchStatusService } from '@/services/show/showEntryWatchStatusService';
import { getQueryKeyFilter } from '@/utils/query/getQueryKeyFilter';
import { setShowEntryWatchStatus } from '@/utils/show/setShowEntryWatchStatus';

/** The show lists whose results depend on watch status. */
const filteredShowListKeys = [ShowQueryKey.SearchShows, ShowQueryKey.AdminShows, ShowQueryKey.HomeShows];

/**
 * Saves show entry watch statuses and mirrors them onto the cached show lists.
 * @returns The save function and the cache patch it uses.
 */
export const useShowEntryWatchStatus = () => {
  const queryClient = useQueryClient();

  /**
   * Marks the show lists that filter on watch status as stale, because patching a cached list cannot add or remove a
   * show. They are not refetched now: a show the user just changed stays visible, and the lists update on the next
   * search, filter change or visit. It only flags the queries, so running it once per entry costs nothing.
   * @returns void
   */
  const markFilteredShowListsStale = (): void => {
    for (const queryKey of filteredShowListKeys) {
      void queryClient.invalidateQueries({ queryKey: [queryKey], refetchType: 'none' });
    }
  };

  /**
   * Patches a watch status onto every cached show query that contains the entry and marks the filtered lists stale,
   * for a save made here or one streamed in from elsewhere.
   * @param showId - The id of the show that owns the entry.
   * @param entryId - The id of the entry.
   * @param watchStatus - The new watch status, or null when it was cleared.
   * @returns void
   */
  const setCachedWatchStatus = (showId: number, entryId: number, watchStatus: ShowEntryWatchStatus | null): void => {
    // Every cached query that may hold shows, including the show drawer's; queries without the entry stay untouched.
    queryClient.setQueriesData(getQueryKeyFilter(ShowQueryKey), (data: unknown) =>
      setShowEntryWatchStatus(data, showId, entryId, watchStatus),
    );
    markFilteredShowListsStale();
  };

  /**
   * Persists a watch status for an entry and patches every cached show query that contains it.
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

    setCachedWatchStatus(entry.show_id, entry.id, watchStatus);

    return watchStatus;
  };

  return {
    saveWatchStatus,
    setCachedWatchStatus,
  };
};
