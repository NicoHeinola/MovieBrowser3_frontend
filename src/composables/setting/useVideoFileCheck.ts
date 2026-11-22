import type { VideoFileCheckStatus } from '@/interfaces/api/models/VideoFileCheckStatus';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useVideoFileRunReport } from '@/composables/setting/useVideoFileRunReport';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { VideoFileCheckQueryKey } from '@/enums/query/videoFileCheckQueryKey';
import { videoFileCheckService } from '@/services/show/videoFileCheckService';

/** How often the status is read while a check runs. */
const POLL_INTERVAL_MS = 3000;

/**
 * Follows the background video file check: reads its status, starts it and reports how it ended.
 * Call it once per page, because each call shows its own snackbars.
 * @returns The check state, the status card to show and the start action.
 */
export const useVideoFileCheck = () => {
  const isStarting = ref<boolean>(false);

  const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
  const { t } = useI18n();

  const { isPending, isRunning, refetch, statusCard } = useVideoFileRunReport<VideoFileCheckStatus>({
    queryKey: [VideoFileCheckQueryKey.AdminVideoFileCheckStatus],
    queryFn: () => videoFileCheckService.get(),
    pollIntervalMs: POLL_INTERVAL_MS,
    getCounts: (status) => ({ done: status.checked, total: status.total, problems: status.missing_video_files_count }),
    // The check updates the shows' missing file flags.
    invalidates: [ShowQueryKey],
    icon: 'mdi-file-search-outline',
    problemIcon: 'mdi-file-alert-outline',
    messages: {
      running: 'settings.videoFileCheckRunning',
      failed: 'settings.videoFileCheckFailed',
      finishedAt: 'settings.videoFileCheckFinishedAt',
      problems: 'settings.videoFileCheckMissing',
      allGood: 'settings.videoFileCheckAllFound',
      never: 'settings.videoFileCheckNever',
      finished: 'settings.videoFileCheckFinished',
      finishedProblems: 'settings.videoFileCheckFinishedMissing',
      interrupted: 'settings.videoFileCheckInterrupted',
    },
  });

  /**
   * Queues the check, then reads the status so progress shows straight away. A check that is already going is followed
   * instead, and one that can't reach the video folder ends at once and reports that as its error.
   * @returns Nothing.
   */
  const startCheck = async (): Promise<void> => {
    isStarting.value = true;

    try {
      await videoFileCheckService.start();
      showSuccessSnackbar(t('settings.videoFileCheckStarted'));
      await refetch();
    } catch (error: unknown) {
      showAPIErrorSnackbar(error);
    } finally {
      isStarting.value = false;
    }
  };

  return { isPending, isRunning, isStarting, startCheck, statusCard };
};
