/** How far the episode sync of a show save is, because uploading video files is the slow part of a save. */
export interface ShowEditorEpisodeProgress {
  /** Episodes created, updated or removed so far. */
  done: number;
  /** Episodes the save creates, updates or removes in all. */
  total: number;
  /** Bytes of picked video files the save uploads in all; 0 when it uploads no files. */
  bytesTotal: number;
  /** Bytes of picked video files not uploaded yet. */
  bytesLeft: number;
  /** Bytes of the file uploading right now, part of `bytesLeft`; 0 between files. */
  bytesCurrent: number;
}
