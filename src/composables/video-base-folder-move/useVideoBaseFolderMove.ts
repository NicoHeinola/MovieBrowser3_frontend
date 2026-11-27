import type { TaskStatus } from '@/components/common/task-status-card';
import type { VideoBaseFolderMoveStatus } from '@/interfaces/api/models/VideoBaseFolderMoveStatus';
import type { ApiErrorDetail } from '@/interfaces/api/responses/ApiErrorDetail';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useBackgroundRun } from '@/composables/background-run/useBackgroundRun';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { ApiErrorCode } from '@/enums/api/ApiErrorCode';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { VideoBaseFolderMoveQueryKey } from '@/enums/query/videoBaseFolderMoveQueryKey';
import { videoBaseFolderMoveService } from '@/services/video-file/videoBaseFolderMoveService';
import { useSettingStore } from '@/stores/setting/useSettingStore';
import { getApiErrorDetailMessage } from '@/utils/api/getApiErrorDetailMessage';
import { isApiErrorCode } from '@/utils/api/isApiErrorCode';
import { getBackgroundRunProgress } from '@/utils/background-run/getBackgroundRunProgress';
import { getQueryKeyFilter } from '@/utils/query/getQueryKeyFilter';
import { formatDateTime } from '@/utils/time/formatDateTime';

/** How often the status is read while the videos move. */
const POLL_INTERVAL_MS = 2000;

/**
 * Follows the background move of the video base folder: reads its status, starts it and reports how it ended. Call it once
 * per page, because each call shows its own snackbars.
 * @returns The move state, the status card to show (or `null`) and the start action.
 */
export const useVideoBaseFolderMove = () => {
  const isStarting = ref<boolean>(false);

  const queryClient = useQueryClient();
  const settingStore = useSettingStore();
  const { showSuccessSnackbar } = useCommonSnackbar();
  const { t } = useI18n();

  /**
   * Translates why a move failed.
   * @param error - The move's error.
   * @returns The message to show.
   */
  const getErrorMessage = (error: ApiErrorDetail): string => {
    const reason = getApiErrorDetailMessage(error);
    const { path } = error.params;

    if (!path) {
      return reason;
    }

    // The backend names the file that it could not move. Usually VLC has that video open, so the admin gets the file
    // and what to do.
    const fileNotMovedText = t('settings.videoBaseFolderMoveFileNotMoved', { path });

    return `${reason} ${fileNotMovedText}`;
  };

  /**
   * Reads the setting and the shows again. A finished move changed the video base folder, and a failed one can leave
   * files in the new folder.
   * @returns Nothing.
   */
  const refreshMovedData = async (): Promise<void> => {
    await Promise.all([settingStore.reloadSettings(), queryClient.invalidateQueries(getQueryKeyFilter(ShowQueryKey))]);
  };

  /**
   * Says where the videos are now.
   * @param current - The status after the move finished.
   * @returns Nothing.
   */
  const reportMoveFinished = (current: VideoBaseFolderMoveStatus): void => {
    showSuccessSnackbar(t('settings.videoBaseFolderMoveFinished', { path: current.to_path }));
  };

  const { status, isError, isRunning, refetch, followStatus } = useBackgroundRun<VideoBaseFolderMoveStatus>({
    queryKey: [VideoBaseFolderMoveQueryKey.AdminVideoBaseFolderMoveStatus],
    queryFn: () => videoBaseFolderMoveService.get(),
    pollIntervalMs: POLL_INTERVAL_MS,
    reportFinished: reportMoveFinished,
    getErrorMessage,
    interruptedMessageKey: 'settings.videoBaseFolderMoveInterrupted',
    refreshChangedData: refreshMovedData,
  });

  /**
   * Describes a running move.
   * @param current - The status.
   * @returns The card.
   */
  const getRunningCard = (current: VideoBaseFolderMoveStatus): TaskStatus => {
    const episodeProgress = getBackgroundRunProgress(current.moved, current.total);

    // A failed move puts the files back where they were, so the card says where they go now.
    if (current.reverting) {
      return {
        type: 'warning',
        icon: 'mdi-undo-variant',
        title: t('settings.videoBaseFolderMoveReverting'),
        text: t('settings.videoBaseFolderMoveRevertingTarget', { path: current.from_path }),
        running: true,
        ...episodeProgress,
      };
    }

    return {
      type: 'info',
      icon: 'mdi-folder-move-outline',
      title: t('settings.videoBaseFolderMoveRunning'),
      text: t('settings.videoBaseFolderMoveTarget', { path: current.to_path }),
      running: true,
      ...episodeProgress,
    };
  };

  /** The card to show: the move's progress, or why the last one failed. A move that succeeded needs none. */
  const statusCard = computed<TaskStatus | null>(() => {
    if (isError.value || !status.value) {
      return null;
    }

    if (isRunning.value) {
      return getRunningCard(status.value);
    }

    const { error, finished_at: finishedAt } = status.value;

    // A failure stays on screen until the next move: after a failed revert the admin still has files to check. An
    // ended move always has its finish time.
    if (error && finishedAt) {
      return {
        type: 'error',
        icon: 'mdi-folder-alert-outline',
        title: t('settings.videoBaseFolderMoveFailedAt', { date: formatDateTime(finishedAt) }),
        text: getErrorMessage(error),
      };
    }

    return null;
  });

  /**
   * Starts to move the videos into a new folder and follows the move.
   * @param path - The new video base folder.
   * @returns Nothing. Throws when the backend turns the move down, so the caller can show why.
   */
  const startFolderMove = async (path: string): Promise<void> => {
    // The backend saves the folder without a slash at the end
    const targetPath = path.replace(/\/+$/, '');

    // The videos already move there, for example after a step back in the setup wizard: nothing to start
    if (isRunning.value && status.value?.to_path === targetPath) {
      return;
    }

    isStarting.value = true;

    try {
      const started = await videoBaseFolderMoveService.start({ video_base_folder: path });

      showSuccessSnackbar(t('settings.videoBaseFolderMoveStarted', { path }));
      await followStatus(started);
    } catch (error: unknown) {
      // Another tab started a move: read it, so its progress shows next to the error.
      if (isApiErrorCode(error, ApiErrorCode.VideoBaseFolderMoveRunning)) {
        await refetch();
      }

      throw error;
    } finally {
      isStarting.value = false;
    }
  };

  return { isRunning, isStarting, startFolderMove, statusCard };
};
