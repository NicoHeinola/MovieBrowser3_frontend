export interface UpdateEpisodeRequest {
  name: string;
  file?: File;
  sequence_number: number;
  /** Moves the episode, and its video file, to another entry of the same show. */
  show_entry_id?: number;
}
