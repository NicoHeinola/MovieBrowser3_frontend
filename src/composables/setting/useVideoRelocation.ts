import type { TaskStatus } from '@/components/common/task-status-card';
import type { VideoRelocationStatus } from '@/interfaces/api/models/VideoRelocationStatus';
import type { ApiErrorDetail } from '@/interfaces/api/responses/ApiErrorDetail';
import type { VideoFileRunOutcome } from '@/utils/show/video-file/getVideoFileRunOutcome';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useVideoFileRun } from '@/composables/setting/useVideoFileRun';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { ApiErrorCode } from '@/enums/api/ApiErrorCode';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { VideoRelocationQueryKey } from '@/enums/query/videoRelocationQueryKey';
import { videoRelocationService } from '@/services/show/videoRelocationService';
import { useSettingStore } from '@/stores/setting/useSettingStore';
import { getApiErrorDetailMessage } from '@/utils/api/getApiErrorDetailMessage';
import { isApiErrorCode } from '@/utils/api/isApiErrorCode';
import { getQueryKeyFilter } from '@/utils/query/getQueryKeyFilter';
import { formatDateTime } from '@/utils/time/formatDateTime';

/** How often the status is read while the videos move. */
const POLL_INTERVAL_MS = 2000;

/**
 * Follows the background move of the video folder: reads its status, starts it and reports how it ended. Call it once
 * per page, because each call shows its own snackbars.
 * @returns The move state, the status card to show (or `null`) and the start action.
 */
export const useVideoRelocation = () => {
  const isStarting = ref<boolean>(false);

  const queryClient = useQueryClient();
  const settingStore = useSettingStore();
  const { showAPIErrorSnackbar, showErrorSnackbar, showSuccessSnackbar, showWarningSnackbar } = useCommonSnackbar();
  const { t } = useI18n();

  /**
   * Translates why a move failed.
   * @param error - The move's error.
   * @returns The message to show.
   */
  const getErrorMessage = (error: ApiErrorDetail): string => {
    const reason = getApiErrorDetailMessage(error);
    const { path } = error.params;

    // The backend names the file it couldn't move when it knows it. That's usually a video VLC still has open, so the
    // admin gets the file and what to do about it.
    return path ? `${reason} ${t('settings.videoRelocationFileNotMoved', { path })}` : reason;
  };

  /**
   * Tells the admin how a move ended and loads what it changed.
   * @param current - The status after the move ended.
   * @param outcome - How it ended.
   * @returns Nothing.
   */
  const reportEnd = async (current: VideoRelocationStatus, outcome: VideoFileRunOutcome): Promise<void> => {
    if (outcome === 'finished') {
      showSuccessSnackbar(t('settings.videoRelocationFinished', { path: current.to_path }));
    } else if (outcome === 'failed' && current.error) {
      showErrorSnackbar(getErrorMessage(current.error));
    } else {
      showWarningSnackbar(t('settings.videoRelocationInterrupted'));
    }

    try {
      // A finished move changed the video folder, and even a failed one may have left files in the new folder.
      await Promise.all([
        settingStore.reloadSettings(),
        queryClient.invalidateQueries(getQueryKeyFilter(ShowQueryKey)),
      ]);
    } catch (error: unknown) {
      showAPIErrorSnackbar(error);
    }
  };

  const { status, isError, isRunning, refetch, followStatus } = useVideoFileRun<VideoRelocationStatus>({
    queryKey: [VideoRelocationQueryKey.AdminVideoRelocationStatus],
    queryFn: () => videoRelocationService.get(),
    pollIntervalMs: POLL_INTERVAL_MS,
    onEnd: reportEnd,
  });

  /** The card to show: the move's progress, or why the last one failed. A move that succeeded needs none. */
  const statusCard = computed<TaskStatus | null>(() => {
    if (isError.value || !status.value) {
      return null;
    }

    const { error, finished_at: finishedAt, from_path: fromPath, moved, reverting, to_path: toPath } = status.value;
    const { total } = status.value;

    if (isRunning.value) {
      const progress = {
        running: true,
        progress: total > 0 ? Math.round((moved / total) * 100) : null,
        progressText:
          total > 0 ? t('settings.episodeProgress', { done: moved, total }) : t('settings.countingEpisodes'),
      };

      // A failed move puts the files back where they were, so the card says where they go now.
      return reverting
        ? {
            type: 'warning',
            icon: 'mdi-undo-variant',
            title: t('settings.videoRelocationReverting'),
            text: t('settings.videoRelocationRevertingTarget', { path: fromPath }),
            ...progress,
          }
        : {
            type: 'info',
            icon: 'mdi-folder-move-outline',
            title: t('settings.videoRelocationRunning'),
            text: t('settings.videoRelocationTarget', { path: toPath }),
            ...progress,
          };
    }

    // A failure stays on screen until the next move: after a failed revert the admin still has files to check. An
    // ended move always has its finish time.
    if (error && finishedAt) {
      return {
        type: 'error',
        icon: 'mdi-folder-alert-outline',
        title: t('settings.videoRelocationFailedAt', { date: formatDateTime(finishedAt) }),
        text: getErrorMessage(error),
      };
    }

    return null;
  });

  /**
   * Starts moving the videos into a new folder and follows the move. With nothing to move, the folder is saved right
   * away and reported like a finished move.
   * @param path - The new video folder.
   * @returns Nothing. Throws when the backend turns the move down, so the caller can show why.
   */
  const startRelocation = async (path: string): Promise<void> => {
    // The videos are already on their way there, such as after stepping back in the setup wizard: nothing to start.
    if (isRunning.value && status.value?.to_path === path) {
      return;
    }

    isStarting.value = true;

    try {
      const started = await videoRelocationService.start({ video_base_path: path });

      if (started.running) {
        showSuccessSnackbar(t('settings.videoRelocationStarted', { path }));
      }

      // A move that ended at once is reported by the run's end handler, like any other end.
      followStatus(started);
    } catch (error: unknown) {
      // Another tab started a move: read it, so its progress shows next to the error.
      if (isApiErrorCode(error, ApiErrorCode.VideoRelocationRunning)) {
        await refetch();
      }

      throw error;
    } finally {
      isStarting.value = false;
    }
  };

  return { isRunning, isStarting, startRelocation, statusCard };
};
