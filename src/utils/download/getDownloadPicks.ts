import type { EntryWithEpisodeDownloads } from '@/interfaces/download/EntryWithEpisodeDownloads';

/** One torrent file picked for a saved episode, as the backend takes it. */
export interface DownloadPick {
  index: number;
  episode_id: number;
}

/**
 * Collects which torrent files are picked for which saved episodes, per download. Episodes that aren't saved yet have
 * no id to pick for, so they are left out.
 * @param entries - The show's entries.
 * @returns The picks by download id, each list ordered by file index.
 */
export const getDownloadPicks = (entries: EntryWithEpisodeDownloads[]): Map<number, DownloadPick[]> => {
  const picks = new Map<number, DownloadPick[]>();

  for (const episode of entries.flatMap((entry) => entry.episodes ?? [])) {
    if (!episode.download || episode.id === undefined) {
      continue;
    }

    const downloadPicks = picks.get(episode.download.id) ?? [];
    downloadPicks.push({ index: episode.download.file_index, episode_id: episode.id });
    picks.set(episode.download.id, downloadPicks);
  }

  for (const downloadPicks of picks.values()) {
    downloadPicks.sort((a, b) => a.index - b.index);
  }

  return picks;
};
