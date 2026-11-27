import type { BackgroundRunStatus } from '@/interfaces/api/models/BackgroundRunStatus';

/**
 * The running video base folder move, or the last one when none runs. `running` includes moving the files back after
 * a failure.
 */
export interface VideoBaseFolderMoveStatus extends BackgroundRunStatus {
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
}
