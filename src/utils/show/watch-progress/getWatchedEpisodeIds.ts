import type { Show } from '@/interfaces/api/models/Show';
import { WatchStatus } from '@/enums/show/WatchStatus';

/**
 * Infers which episodes have been watched from the show's watch progress and entry watch statuses.
 * Watched status is not stored, so every episode before the last started one counts as watched,
 * and so does every episode of an entry marked completed.
 * Entries and episodes are expected in their backend order (`sort_order`, `sequence_number`).
 * @param show - The show, with its entries and watch progress.
 * @returns The ids of the watched episodes.
 */
export const getWatchedEpisodeIds = (
  show: Pick<Show, 'entries' | 'watch_progress'> | null | undefined,
): Set<number> => {
  const entries = show?.entries ?? [];
  const progressEpisodeId = show?.watch_progress?.episode_id;
  const episodes = entries.flatMap((entry) => entry.episodes ?? []);
  const progressIndex = episodes.findIndex((episode) => episode.id === progressEpisodeId);

  const watchedEpisodes = [
    ...episodes.slice(0, Math.max(progressIndex, 0)),
    ...entries
      .filter((entry) => entry.watch_status?.status === WatchStatus.Completed)
      .flatMap((entry) => entry.episodes ?? []),
  ];

  return new Set(watchedEpisodes.map((episode) => episode.id));
};
