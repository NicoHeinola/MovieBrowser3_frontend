import type { EpisodeDownload } from '@/interfaces/api/models/EpisodeDownload';

export interface EpisodeFormData {
  id?: number;
  name: string;
  file?: File;
  filename?: string;
  has_video_file?: boolean;
  video_file_size?: number | null;
  video_duration_seconds?: number | null;
  sequence_number: number;
  /** The torrent file picked for this episode, which downloads into it once the show is saved. */
  download?: EpisodeDownload | null;
}
