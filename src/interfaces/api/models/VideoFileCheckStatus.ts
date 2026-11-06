import type { ApiErrorDetail } from '@/interfaces/api/responses/ApiErrorDetail';

export interface VideoFileCheckStatus {
  /** Whether a check is in progress. */
  running: boolean;
  /** Episodes checked so far in the running check, 0 when idle. */
  checked: number;
  /** Episodes in the running check, 0 when idle. */
  total: number;
  /** When the last run finished. Keeps its value while a new run is going. */
  finished_at: string | null;
  /** Why the last finished run failed, including the daily run. */
  error: ApiErrorDetail | null;
  /** Episodes whose uploaded file is gone right now. Leaves out episodes that never had a file. */
  missing_video_files_count: number;
}
