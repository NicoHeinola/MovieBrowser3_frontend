import type { ApiErrorDetail } from '@/interfaces/api/responses/ApiErrorDetail';

/** The fields that every background run reports, such as the video file check and the video base folder move. */
export interface BackgroundRunStatus {
  /** Whether a run is in progress. */
  running: boolean;
  /** When the last run ended. It keeps its value while a new run is in progress. */
  finished_at: string | null;
  /** Why the last run failed, `null` when it succeeded. */
  error: ApiErrorDetail | null;
}
