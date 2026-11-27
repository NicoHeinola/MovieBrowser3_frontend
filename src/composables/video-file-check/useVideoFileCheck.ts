import type { TaskStatus } from '@/components/common/task-status-card';
import type { VideoFileCheckStatus } from '@/interfaces/api/models/VideoFileCheckStatus';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useBackgroundRun } from '@/composables/background-run/useBackgroundRun';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useVideoFileCheckReport } from '@/composables/video-file-check/useVideoFileCheckReport';
import { VideoFileCheckQueryKey } from '@/enums/query/videoFileCheckQueryKey';
import { videoFileCheckService } from '@/services/video-file/videoFileCheckService';
import { getApiErrorDetailMessage } from '@/utils/api/getApiErrorDetailMessage';
import { getBackgroundRunProgress } from '@/utils/background-run/getBackgroundRunProgress';
import { getVideoFileProblemsText } from '@/utils/show/video-file/getVideoFileProblemsText';
import { formatDateTime } from '@/utils/time/formatDateTime';

/** How often the status is read while a check runs. */
const POLL_INTERVAL_MS = 3000;

/**
 * Follows the background video file check: reads its status, starts it and reports how it ended.
 * Call it once per page, because each call shows its own snackbars.
 * @returns The check state, the status card to show and the start action.
 */
export const useVideoFileCheck = () => {
  const isStarting = ref<boolean>(false);

  const { reportFinished, refreshCheckedData } = useVideoFileCheckReport();
  const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
  const { t } = useI18n();

  const { status, isError, isPending, isRunning, followStatus } = useBackgroundRun<VideoFileCheckStatus>({
    queryKey: [VideoFileCheckQueryKey.AdminVideoFileCheckStatus],
    queryFn: () => videoFileCheckService.get(),
    pollIntervalMs: POLL_INTERVAL_MS,
    reportFinished,
    // Such as an unreachable video base folder, which the backend reports on the check instead of refusing the start.
    getErrorMessage: getApiErrorDetailMessage,
    interruptedMessageKey: 'settings.videoFileCheckInterrupted',
    refreshChangedData: refreshCheckedData,
  });

  /**
   * Queues the check and follows it at once. When a check is already in progress, it follows that check.
   * @returns Nothing.
   */
  const startCheck = async (): Promise<void> => {
    isStarting.value = true;

    try {
      const startedStatus = await videoFileCheckService.start();

      await followStatus(startedStatus);
      showSuccessSnackbar(t('settings.videoFileCheckStarted'));
    } catch (error: unknown) {
      showAPIErrorSnackbar(error);
    } finally {
      isStarting.value = false;
    }
  };

  /**
   * Describes a running check.
   * @param current - The status.
   * @returns The card.
   */
  const getRunningCard = ({ checked, total }: VideoFileCheckStatus): TaskStatus => ({
    type: 'info',
    icon: 'mdi-file-search-outline',
    title: t('settings.videoFileCheckRunning'),
    running: true,
    ...getBackgroundRunProgress(checked, total),
  });

  /**
   * Describes a finished check by the problems there are now.
   * @param current - The status.
   * @param finishedAt - When it finished.
   * @returns The card.
   */
  const getFinishedCard = (current: VideoFileCheckStatus, finishedAt: string): TaskStatus => {
    const title = t('settings.videoFileCheckFinishedAt', { date: formatDateTime(finishedAt) });
    const problemsText = getVideoFileProblemsText(current);

    if (problemsText === null) {
      return { type: 'success', icon: 'mdi-check-circle-outline', title, text: t('settings.videoFileCheckAllFound') };
    }

    return { type: 'warning', icon: 'mdi-file-alert-outline', title, text: problemsText };
  };

  /** The status card. A running check goes first, because the last one's result stays set during it. */
  const statusCard = computed<TaskStatus>(() => {
    // The status is unknown, so neither an old result nor "never checked" would be true.
    if (isError.value) {
      return { type: 'error', icon: 'mdi-alert-circle-outline', title: t('apiErrors.generic') };
    }

    if (status.value?.running) {
      return getRunningCard(status.value);
    }

    if (status.value?.error) {
      return {
        type: 'error',
        icon: 'mdi-file-alert-outline',
        title: t('settings.videoFileCheckFailed'),
        text: getApiErrorDetailMessage(status.value.error),
      };
    }

    if (status.value?.finished_at) {
      return getFinishedCard(status.value, status.value.finished_at);
    }

    return { type: 'info', icon: 'mdi-file-search-outline', title: t('settings.videoFileCheckNever') };
  });

  return { isPending, isRunning, isStarting, startCheck, statusCard };
};
