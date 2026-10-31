import type { Show } from '@/interfaces/api/models/Show';
import type { ShowWatchProgress } from '@/interfaces/api/models/ShowWatchProgress';
import { useQueryClient } from '@tanstack/vue-query';

import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { setShowWatchProgress } from '@/utils/show/setShowWatchProgress';

/** Every cached query that may hold shows; patching one that does not contain the show leaves it untouched. */
const showQueryKeys = Object.values(ShowQueryKey);

/** The cached show list ordered by progress, refetched on a change so a show can move up or join it. */
const progressOrderedQueryKey = ShowQueryKey.ContinueWatchingShows;

/**
 * Checks whether a cached show list already holds this exact progress, such as one applied moments ago.
 * @param shows - The cached show list.
 * @param watchProgress - The progress to look for.
 * @returns Whether the list's show already carries the progress.
 */
const hasWatchProgress = (shows: Show[] | undefined, watchProgress: ShowWatchProgress): boolean =>
  shows?.some(
    (show) =>
      show.id === watchProgress.show_id &&
      show.watch_progress?.episode_id === watchProgress.episode_id &&
      show.watch_progress?.updated_at === watchProgress.updated_at,
  ) ?? false;

/**
 * Keeps every cached show, including the one open in the show drawer, in line with the user's progress.
 * @returns Functions that apply one progress change or refetch every show list.
 */
export const useShowWatchProgressCache = () => {
  const queryClient = useQueryClient();

  /**
   * Patches the progress onto every cached show and refetches the progress-ordered list unless it already holds the
   * progress. A play response and its stream event carry the same progress, so the second is cheap.
   * @param watchProgress - The new watch progress of one show.
   * @returns void
   */
  const applyWatchProgress = (watchProgress: ShowWatchProgress): void => {
    const isOrderStale = queryClient
      .getQueriesData<Show[]>({ queryKey: [progressOrderedQueryKey] })
      .some(([, shows]) => !hasWatchProgress(shows, watchProgress));

    for (const queryKey of showQueryKeys) {
      queryClient.setQueriesData({ queryKey: [queryKey] }, (data: unknown) =>
        setShowWatchProgress(data, watchProgress),
      );
    }

    if (isOrderStale) {
      void queryClient.invalidateQueries({ queryKey: [progressOrderedQueryKey] });
    }
  };

  /**
   * Refetches every cached show list, for when progress changes may have been missed. Only active lists refetch now.
   * @returns void
   */
  const refetchShowLists = (): void => {
    for (const queryKey of showQueryKeys) {
      void queryClient.invalidateQueries({ queryKey: [queryKey] });
    }
  };

  return {
    applyWatchProgress,
    refetchShowLists,
  };
};
