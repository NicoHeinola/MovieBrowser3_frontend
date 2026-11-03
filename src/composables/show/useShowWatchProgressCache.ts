import type { Show } from '@/interfaces/api/models/Show';
import type { ShowWatchProgress } from '@/interfaces/api/models/ShowWatchProgress';
import { useQueryClient } from '@tanstack/vue-query';

import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { getQueryKeyFilter } from '@/utils/query/getQueryKeyFilter';
import { setShowWatchProgress } from '@/utils/show/setShowWatchProgress';

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
 * @returns Functions that apply one progress change or refetch every show list.
 */
export const useShowWatchProgressCache = () => {
  const queryClient = useQueryClient();

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
   * Refetches every cached show list, for when progress changes may have been missed. Only active lists refetch now.
   * @returns void
   */
  const refetchShowLists = (): void => {
    void queryClient.invalidateQueries(getQueryKeyFilter(ShowQueryKey));
  };

  return {
    applyWatchProgress,
    refetchShowLists,
  };
};
