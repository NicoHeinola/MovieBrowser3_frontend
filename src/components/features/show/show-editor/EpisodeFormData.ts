export interface EpisodeFormData {
  id?: number;
  name: string;
  file?: File;
  filename?: string;
  has_video_file?: boolean;
  video_file_size?: number | null;
  sequence_number: number;
}
