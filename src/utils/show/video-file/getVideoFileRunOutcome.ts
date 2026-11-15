import type { ApiErrorDetail } from '@/interfaces/api/responses/ApiErrorDetail';

/** The fields every background video file run reports, such as the file check and the folder move. */
export interface VideoFileRunStatus {
  running: boolean;
  finished_at: string | null;
  error: ApiErrorDetail | null;
}

/** How a run ended: it finished, it failed with an error, or its worker died without saying. */
export type VideoFileRunOutcome = 'finished' | 'failed' | 'interrupted';

/**
 * Tells how a background video file run ended, by comparing two status reads.
 *
 * @param previous The earlier status, or undefined on the first read.
 * @param current The latest status.
 * @returns How the run ended, or null when no run ended between the two reads.
 */
export const getVideoFileRunOutcome = (
  previous: VideoFileRunStatus | undefined,
  current: VideoFileRunStatus,
): VideoFileRunOutcome | null => {
  // The first read has nothing to compare with, and a running run hasn't ended.
  if (!previous || current.running) {
    return null;
  }

  // A new finish time means a run ended, even one so short that no read ever saw it running.
  if (current.finished_at !== previous.finished_at) {
    return current.error ? 'failed' : 'finished';
  }

  // A dead worker's run stops reading as running without ever updating the finish time.
  return previous.running ? 'interrupted' : null;
};
