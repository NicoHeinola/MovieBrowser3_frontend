import type { ShowWatchProgress } from '@/interfaces/api/models/ShowWatchProgress';

/**
 * Finds where playing the progress episode resumes. Like the backend, any saved position resumes.
 * @param progress - The show's watch progress.
 * @returns The position in seconds, or null when the episode starts from the beginning.
 */
export const getResumePosition = (progress: ShowWatchProgress | null | undefined): number | null => {
  const position = progress?.position_seconds;

  return position && position > 0 ? position : null;
};
