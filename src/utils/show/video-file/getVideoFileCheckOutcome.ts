import type { VideoFileCheckStatus } from '@/interfaces/api/models/VideoFileCheckStatus';

/**
 * Tells how a video file check ended, by comparing two status reads.
 *
 * @param previous The earlier status, or undefined on the first read.
 * @param current The latest status.
 * @returns How the check ended, or null when no check ended between the two reads.
 */
export const getVideoFileCheckOutcome = (
  previous: VideoFileCheckStatus | undefined,
  current: VideoFileCheckStatus,
): 'finished' | 'failed' | 'interrupted' | null => {
  // The first read has nothing to compare with, and a running check hasn't ended.
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
