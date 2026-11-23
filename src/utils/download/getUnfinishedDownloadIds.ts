import type { EntryWithEpisodeDownloads } from '@/interfaces/download/EntryWithEpisodeDownloads';

/**
 * The downloads some episode of the show still waits for, so the editor can show their progress without being opened
 * from the downloads list.
 * @param entries - The show's entries.
 * @returns Their ids, each once, in no set order.
 */
export const getUnfinishedDownloadIds = (entries: EntryWithEpisodeDownloads[]): number[] => {
  const ids = entries
    .flatMap((entry) => entry.episodes ?? [])
    .filter((episode) => episode.download && !episode.download.imported_at)
    .map((episode) => episode.download!.id);

  return [...new Set(ids)];
};
