export interface DashboardStatsResponse {
  shows_count: number;
  shows_added_last_7_days: number;
  shows_added_last_30_days: number;
  episodes_count: number;
  episodes_missing_video_file_count: number;
  websites_count: number;
  users_count: number;
  /** Sum of the known video file sizes of episodes that have a file, in bytes. */
  video_files_total_bytes: number;
  /** Size of the disk holding the video folder; null when unknown or unset. */
  disk_total_bytes: number | null;
  /** Free space on that disk; null when unknown or unset. */
  disk_free_bytes: number | null;
}
