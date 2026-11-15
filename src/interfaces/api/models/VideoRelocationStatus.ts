import type { ApiErrorDetail } from '@/interfaces/api/responses/ApiErrorDetail';

/** The running video folder move, or the last one when none runs. */
export interface VideoRelocationStatus {
  /** Whether a move is in progress, including moving files back after a failure. */
  running: boolean;
  /** Whether the move failed and the files are being moved back to `from_path`. */
  reverting: boolean;
  /** Episode files moved so far, or moved back while reverting. */
  moved: number;
  /** Episode files to move. */
  total: number;
  /** The folder the files move from, `null` when no move ever ran. */
  from_path: string | null;
  /** The folder the files move to, `null` when no move ever ran. */
  to_path: string | null;
  /** When the move ended, `null` while it runs or when none ever ran. */
  finished_at: string | null;
  /** Why the last move failed, `null` when it succeeded. */
  error: ApiErrorDetail | null;
}
