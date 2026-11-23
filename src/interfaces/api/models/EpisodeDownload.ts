import type { DownloadStatus } from '@/enums/download/DownloadStatus';

/** The torrent file an episode waits for. */
export interface EpisodeDownload {
  /** The download's id. */
  id: number;
  /** The file's index in the torrent. */
  file_index: number;
  /** The file's path inside the torrent. */
  path: string;
  /** The download's status; missing on a pick that isn't saved yet. */
  status?: DownloadStatus;
  /** When the file became the episode's video file; null until then. */
  imported_at?: string | null;
}
