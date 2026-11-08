export interface Episode {
  id: number;
  show_entry_id: number;
  name: string;
  filename: string;
  has_video_file: boolean;
  /** In bytes; null when there is no file or it has not been measured yet. */
  video_file_size: number | null;
  sequence_number: number;
}
