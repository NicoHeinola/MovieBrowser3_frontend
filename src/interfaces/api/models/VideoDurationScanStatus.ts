import type { ApiErrorDetail } from '@/interfaces/api/responses/ApiErrorDetail';

export interface VideoDurationScanStatus {
  /** Whether a scan is reading episode lengths. */
  running: boolean;
  /** Episodes read so far in the running scan, 0 when idle. */
  read: number;
  /** Episodes in the running scan, 0 when idle. Grows when more are queued during it, such as an upload. */
  total: number;
  /** When the last scan finished. Keeps its value while a new scan is going. */
  finished_at: string | null;
  /** Why the last finished scan failed. Its unread episodes wait for the next scan. */
  error: ApiErrorDetail | null;
  /** Episodes with a file but no length, leaving out those a running scan is about to read. */
  unknown_durations_count: number;
}
