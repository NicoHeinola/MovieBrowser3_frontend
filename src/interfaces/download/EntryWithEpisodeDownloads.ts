import type { EpisodeDownload } from '@/interfaces/api/models/EpisodeDownload';

/** An entry as the show editor holds it: only the episode fields that tell which torrent file it waits for. */
export interface EntryWithEpisodeDownloads {
  /** A new episode has no id yet. */
  episodes?: { id?: number; download?: EpisodeDownload | null }[];
}
