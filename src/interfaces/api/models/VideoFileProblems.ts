/** How many episodes have something wrong with their video file. */
export interface VideoFileProblems {
  /** Episodes whose uploaded file is gone. Leaves out episodes that never had a file. */
  missing_video_files_count: number;
  /** Episodes whose file is there but has no known length: it can't be read, or a new file isn't read yet. */
  unknown_video_durations_count: number;
}
