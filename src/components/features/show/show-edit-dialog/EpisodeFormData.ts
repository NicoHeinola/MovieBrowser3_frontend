export interface EpisodeFormData {
  id?: number;
  name: string;
  file?: File;
  filename?: string;
  has_video_file?: boolean;
  sequence_number: number;
}
