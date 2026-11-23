import type { EpisodeDownload } from '@/interfaces/api/models/EpisodeDownload';

/** An entry as the editor holds it: only the episode fields that tell which torrent file it waits for. */
interface EntryWithEpisodeDownloads {
  episodes?: { download?: EpisodeDownload | null }[];
}

/**
 * The files of one download that some episode already waits for, saved or not, so they aren't offered twice.
 * @param entries - The show's entries.
 * @param downloadId - The download.
 * @returns The picked file indexes.
 */
export const getPickedDownloadFileIndexes = (entries: EntryWithEpisodeDownloads[], downloadId: number): Set<number> => {
  return new Set(
    entries
      .flatMap((entry) => entry.episodes ?? [])
      .filter((episode) => episode.download?.id === downloadId)
      .map((episode) => episode.download!.file_index),
  );
};
