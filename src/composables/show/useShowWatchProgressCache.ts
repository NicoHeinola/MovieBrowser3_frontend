import type { Show } from '@/interfaces/api/models/Show';
import type { ShowEntryWatchStatusChange } from '@/interfaces/api/models/ShowEntryWatchStatusChange';
import type { ShowWatchProgress } from '@/interfaces/api/models/ShowWatchProgress';
import { useQueryClient } from '@tanstack/vue-query';

import { useShowEntryWatchStatus } from '@/composables/show/useShowEntryWatchStatus';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { getQueryKeyFilter } from '@/utils/query/getQueryKeyFilter';
import { setShowWatchProgress } from '@/utils/show/query-cache/setShowWatchProgress';

/** The cached show list ordered by progress, refetched on a change so a show can move up or join it. */
const progressOrderedQueryKey = ShowQueryKey.ContinueWatchingShows;

/**
 * Checks whether a cached progress-ordered list already shows this progress in place: the show leads the list on the
 * same episode. Position updates while watching then patch the list without refetching it every few seconds.
 * @param shows - The cached show list, most recently watched first.
 * @param watchProgress - The progress to look for.
 * @returns Whether the list's order already matches the progress.
 */
const isLeadingWithProgress = (shows: Show[] | undefined, watchProgress: ShowWatchProgress): boolean => {
  const leadingShow = shows?.[0];

  return (
    leadingShow?.id === watchProgress.show_id &&
    leadingShow.watch_progress?.show_entry_id === watchProgress.show_entry_id &&
    leadingShow.watch_progress?.episode_id === watchProgress.episode_id
  );
};

/**
 * Keeps every cached show, including the one open in the show drawer, in line with the user's progress.
 * @returns Functions that apply one progress or watch status change, or refetch every show list.
 */
export const useShowWatchProgressCache = () => {
  const queryClient = useQueryClient();
  const { setCachedWatchStatus } = useShowEntryWatchStatus();

  /**
   * Patches the progress onto every cached show and refetches the progress-ordered list unless the show already leads
   * it on the same episode. A play response and its stream event carry the same progress, so the second is cheap.
   * @param watchProgress - The new watch progress of one show.
   * @returns void
   */
  const applyWatchProgress = (watchProgress: ShowWatchProgress): void => {
    const isOrderStale = queryClient
      .getQueriesData<Show[]>({ queryKey: [progressOrderedQueryKey] })
      .some(([, shows]) => !isLeadingWithProgress(shows, watchProgress));

    // Every cached query that may hold shows; patching one that does not contain the show leaves it untouched.
    queryClient.setQueriesData(getQueryKeyFilter(ShowQueryKey), (data: unknown) =>
      setShowWatchProgress(data, watchProgress),
    );

    if (isOrderStale) {
      void queryClient.invalidateQueries({ queryKey: [progressOrderedQueryKey] });
    }
  };

  /**
   * Patches a streamed watch status onto every cached show, the same way a save in this tab does. Lists that filter on
   * watch status are only marked stale, so a show does not vanish under the user; they update on the next search,
   * filter change or visit. Marking stale twice is harmless, so echoes of this tab's own saves need no special case.
   * @param change - The new watch status of one show entry.
   * @returns void
   */
  const applyWatchStatus = (change: ShowEntryWatchStatusChange): void => {
    const watchStatus = change.status ? { show_entry_id: change.show_entry_id, status: change.status } : null;

    setCachedWatchStatus(change.show_id, change.show_entry_id, watchStatus);
  };

  /**
   * Refetches every cached show list, for when progress changes may have been missed. Only active lists refetch now.
   * @returns void
   */
  const refetchShowLists = (): void => {
    void queryClient.invalidateQueries(getQueryKeyFilter(ShowQueryKey));
  };

  return {
    applyWatchProgress,
    applyWatchStatus,
    refetchShowLists,
  };
};
