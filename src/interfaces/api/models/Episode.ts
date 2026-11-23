import type { EpisodeDownload } from './EpisodeDownload';

export interface Episode {
  id: number;
  show_entry_id: number;
  name: string;
  filename: string;
  has_video_file: boolean;
  /** In bytes; null when there is no file or it has not been measured yet. */
  video_file_size: number | null;
  /** In whole seconds; null until a background scan reads it, or when it can't be read. */
  video_duration_seconds: number | null;
  sequence_number: number;
  /** The torrent file this episode waits for, or null. */
  download?: EpisodeDownload | null;
}
