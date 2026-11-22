import type { Show } from '@/interfaces/api/models/Show';

/**
 * Adds up the known video lengths of every episode in a show.
 * @param show - The show, with its entries and their episodes loaded.
 * @returns The total in seconds; episodes without a file or a known length count as 0.
 */
export const getShowVideoSeconds = (show: Pick<Show, 'entries'>): number =>
  (show.entries ?? [])
    .flatMap((entry) => entry.episodes ?? [])
    .reduce((sum, episode) => sum + (episode.has_video_file ? (episode.video_duration_seconds ?? 0) : 0), 0);
