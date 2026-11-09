import type { Episode } from '@/interfaces/api/models/Episode';
import type { Show } from '@/interfaces/api/models/Show';
import type { ShowEntry } from '@/interfaces/api/models/ShowEntry';

/**
 * Picks the episode playback should start from: the last started episode when it is in scope, otherwise the first one.
 * Entries and episodes are expected in their backend order (`sort_order`, `sequence_number`).
 * @param show - The show, with its entries and watch progress.
 * @param entry - Limits the pick to this entry, or null to consider the whole show.
 * @returns The episode to play, or null when there is nothing to play.
 */
export const getResumeEpisode = (
  show: Pick<Show, 'entries' | 'watch_progress'> | null | undefined,
  entry: Pick<ShowEntry, 'id' | 'episodes'> | null = null,
): Episode | null => {
  const entries = entry ? [entry] : (show?.entries ?? []);
  const progress = show?.watch_progress;

  const progressEntry = progress ? entries.find((candidate) => candidate.id === progress.show_entry_id) : undefined;
  const resumeEpisode = progressEntry?.episodes?.find((episode) => episode.id === progress?.episode_id);

  if (resumeEpisode) {
    return resumeEpisode;
  }

  return entries.find((candidate) => (candidate.episodes?.length ?? 0) > 0)?.episodes?.[0] ?? null;
};
