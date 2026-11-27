import type { VideoFileProblems } from '@/interfaces/api/models/VideoFileProblems';
import { useQueryClient } from '@tanstack/vue-query';
import { useI18n } from 'vue-i18n';

import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { DashboardQueryKey } from '@/enums/query/dashboardQueryKey';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { getQueryKeyFilter } from '@/utils/query/getQueryKeyFilter';
import { getVideoFileProblemsText } from '@/utils/show/video-file/getVideoFileProblemsText';

/**
 * What every video file check does when it ends, whether it checked one show or all of them.
 * @returns `reportFinished`, which says what a check found, and `refreshCheckedData`, which reads again what one changes.
 */
export const useVideoFileCheckReport = () => {
  const queryClient = useQueryClient();
  const { showSuccessSnackbar, showWarningSnackbar } = useCommonSnackbar();
  const { t } = useI18n();

  /**
   * Says what a finished check found.
   * @param problems - The problems it found.
   * @returns Nothing.
   */
  const reportFinished = (problems: VideoFileProblems): void => {
    const problemsText = getVideoFileProblemsText(problems);

    if (problemsText === null) {
      showSuccessSnackbar(t('settings.videoFileCheckFinished'));
      return;
    }

    showWarningSnackbar(t('settings.videoFileCheckFinishedProblems', { problems: problemsText }));
  };

  /**
   * Refreshes the shows, which hold the missing flags, sizes and lengths, and the dashboard, which adds them up.
   * @returns Nothing.
   */
  const refreshCheckedData = async (): Promise<void> => {
    await queryClient.invalidateQueries(getQueryKeyFilter(ShowQueryKey, DashboardQueryKey));
  };

  return { reportFinished, refreshCheckedData };
};
