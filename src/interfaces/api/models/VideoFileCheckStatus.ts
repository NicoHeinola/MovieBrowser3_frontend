import type { BackgroundRunStatus } from '@/interfaces/api/models/BackgroundRunStatus';
import type { VideoFileProblems } from '@/interfaces/api/models/VideoFileProblems';

/** Where the check of every video file stands, and the problems there are right now. */
export interface VideoFileCheckStatus extends BackgroundRunStatus, VideoFileProblems {
  /** Episodes checked so far in the running check, 0 when idle. */
  checked: number;
  /** Episodes in the running check, 0 when idle. */
  total: number;
}
