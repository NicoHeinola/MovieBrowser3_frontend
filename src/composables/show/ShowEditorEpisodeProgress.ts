/** How far the episode sync of a show save is, because uploading video files is the slow part of a save. */
export interface ShowEditorEpisodeProgress {
  /** Episodes created, updated or removed so far. */
  done: number;
  /** Episodes the save creates, updates or removes in all. */
  total: number;
}
