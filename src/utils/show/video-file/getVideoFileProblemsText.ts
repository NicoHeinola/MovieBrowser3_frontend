import type { VideoFileProblems } from '@/interfaces/api/models/VideoFileProblems';

import { i18n } from '@/plugins/i18n';

/**
 * Says what is wrong with video files, such as `2 video files are missing, 1 video has no known length`.
 * @param problems - How many files have each problem.
 * @returns The text, or null when nothing is wrong.
 */
export const getVideoFileProblemsText = (problems: VideoFileProblems): string | null => {
  const { t } = i18n.global;
  const { missing_video_files_count: missingFileCount, unknown_video_durations_count: unknownLengthCount } = problems;
  const problemTexts: string[] = [];

  if (missingFileCount > 0) {
    problemTexts.push(t('settings.videoFileCheckMissing', { count: missingFileCount }, missingFileCount));
  }

  if (unknownLengthCount > 0) {
    problemTexts.push(t('settings.videoFileCheckUnknownLengths', { count: unknownLengthCount }, unknownLengthCount));
  }

  if (problemTexts.length === 0) {
    return null;
  }

  return problemTexts.join(', ');
};
