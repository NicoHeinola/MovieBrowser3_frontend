import type { TaskStatus } from '@/components/common/task-status-card';
import type { VideoFileCheckStatus } from '@/interfaces/api/models/VideoFileCheckStatus';
import type { VideoFileRunOutcome } from '@/utils/show/video-file/getVideoFileRunOutcome';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useVideoFileRun } from '@/composables/setting/useVideoFileRun';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { VideoFileCheckQueryKey } from '@/enums/query/videoFileCheckQueryKey';
import { videoFileCheckService } from '@/services/show/videoFileCheckService';
import { getApiErrorDetailMessage } from '@/utils/api/getApiErrorDetailMessage';
import { getQueryKeyFilter } from '@/utils/query/getQueryKeyFilter';
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

  const queryClient = useQueryClient();
  const { showAPIErrorSnackbar, showErrorSnackbar, showSuccessSnackbar, showWarningSnackbar } = useCommonSnackbar();
  const { t } = useI18n();

  /**
   * Tells the admin how a check ended and refreshes the shows it may have changed.
   * @param current - The status after the check ended.
   * @param outcome - How it ended.
   * @returns Nothing.
   */
  const reportEnd = async (current: VideoFileCheckStatus, outcome: VideoFileRunOutcome): Promise<void> => {
    if (outcome === 'interrupted') {
      showWarningSnackbar(t('settings.videoFileCheckInterrupted'));
    }

    // Such as an unreachable video folder, which the backend reports on the run instead of refusing the start.
    if (outcome === 'failed' && current.error) {
      showErrorSnackbar(getApiErrorDetailMessage(current.error));
    }

    if (outcome === 'finished') {
      const { missing_video_files_count: count } = current;

      if (count > 0) {
        showWarningSnackbar(t('settings.videoFileCheckFinishedMissing', { count }, count));
      } else {
        showSuccessSnackbar(t('settings.videoFileCheckFinished'));
      }
    }

    // Even a crashed run may have updated some episodes, and cached shows still hold the old flags.
    await queryClient.invalidateQueries(getQueryKeyFilter(ShowQueryKey));
  };

  const { status, isError, isPending, isRunning, refetch } = useVideoFileRun<VideoFileCheckStatus>({
    queryKey: [VideoFileCheckQueryKey.AdminVideoFileCheckStatus],
    queryFn: () => videoFileCheckService.get(),
    pollIntervalMs: POLL_INTERVAL_MS,
    onEnd: reportEnd,
  });

  /** Why the last run failed, or null when it didn't. */
  const errorMessage = computed<string | null>(() => {
    const error = status.value?.error;

    if (!error) {
      return null;
    }

    return getApiErrorDetailMessage(error);
  });

  /** The status card. A run in progress goes first, because the last run's result stays set during a new one. */
  const statusCard = computed<TaskStatus>(() => {
    // The status is unknown, so neither an old result nor "not checked yet" would be true.
    if (isError.value) {
      return { type: 'error', icon: 'mdi-alert-circle-outline', title: t('apiErrors.generic') };
    }

    const {
      checked = 0,
      finished_at: finishedAt = null,
      missing_video_files_count: missingCount = 0,
      total = 0,
    } = status.value ?? {};

    if (isRunning.value) {
      return {
        type: 'info',
        icon: 'mdi-file-search-outline',
        title: t('settings.videoFileCheckRunning'),
        running: true,
        progress: total > 0 ? Math.round((checked / total) * 100) : null,
        progressText:
          total > 0 ? t('settings.episodeProgress', { done: checked, total }) : t('settings.countingEpisodes'),
      };
    }

    if (errorMessage.value) {
      return {
        type: 'error',
        icon: 'mdi-file-alert-outline',
        title: t('settings.videoFileCheckFailed'),
        text: errorMessage.value,
      };
    }

    if (finishedAt) {
      const title = t('settings.videoFileCheckFinishedAt', { date: formatDateTime(finishedAt) });

      if (missingCount > 0) {
        const text = t('settings.videoFileCheckMissing', { count: missingCount }, missingCount);

        return { type: 'warning', icon: 'mdi-file-alert-outline', title, text };
      }

      return { type: 'success', icon: 'mdi-check-circle-outline', title, text: t('settings.videoFileCheckAllFound') };
    }

    return { type: 'info', icon: 'mdi-file-search-outline', title: t('settings.videoFileCheckNever') };
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
