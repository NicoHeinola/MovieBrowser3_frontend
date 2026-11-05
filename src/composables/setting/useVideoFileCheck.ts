import type { VideoFileCheckStatus } from '@/interfaces/api/models/VideoFileCheckStatus';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { ApiErrorCode } from '@/enums/api/ApiErrorCode';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { VideoFileCheckQueryKey } from '@/enums/query/videoFileCheckQueryKey';
import { videoFileCheckService } from '@/services/show/videoFileCheckService';
import { isApiErrorCode } from '@/utils/api/isApiErrorCode';
import { getQueryKeyFilter } from '@/utils/query/getQueryKeyFilter';
import { getVideoFileCheckOutcome } from '@/utils/show/getVideoFileCheckOutcome';

/** How often the status is read while a check runs. */
const POLL_INTERVAL_MS = 3000;

/**
 * Follows the background video file check: reads its status, starts it and reports how it ended.
 * Call it once per page, because each call shows its own snackbars.
 * @returns The check state, the status alert to show and the start action.
 */
export const useVideoFileCheck = () => {
  const isStarting = ref<boolean>(false);

  const queryClient = useQueryClient();
  const { showAPIErrorSnackbar, showSuccessSnackbar, showWarningSnackbar } = useCommonSnackbar();
  const { locale, t, te } = useI18n();

  const {
    data: status,
    isError,
    isPending,
    refetch,
  } = useAPIQuery<VideoFileCheckStatus>({
    queryKey: [VideoFileCheckQueryKey.AdminVideoFileCheckStatus],
    queryFn: () => videoFileCheckService.get(),
    // A check can start or end while this page is closed, so read it on each visit.
    staleTime: 0,
    // Poll only during a run, so an idle settings page sends no requests. A failed read stops it too: each failure
    // shows a snackbar, and a window refocus or the next start reads the status again.
    refetchInterval: (query) =>
      query.state.data?.running && query.state.status !== 'error' ? POLL_INTERVAL_MS : false,
  });

  /** Whether a check is known to run. After a failed read the last answer can't be trusted, so the button stays usable. */
  const isRunning = computed<boolean>(() => !isError.value && (status.value?.running ?? false));

  /** Why the last run failed, or null when it didn't. */
  const errorMessage = computed<string | null>(() => {
    const error = status.value?.error;

    if (!error) {
      return null;
    }

    // A newer backend can send a code this build has no message for.
    const key = `apiErrors.codes.${error.code}`;

    return te(key) ? t(key, error.params) : t('apiErrors.generic');
  });

  /** The status alert. A run in progress goes first, because the last run's result stays set during a new one. */
  const statusAlert = computed<{ text: string; type: 'error' | 'info' | 'success' }>(() => {
    // The status is unknown, so neither an old result nor "not checked yet" would be true.
    if (isError.value) {
      return { text: t('apiErrors.generic'), type: 'error' };
    }

    const { checked = 0, finished_at: finishedAt = null, total = 0 } = status.value ?? {};

    if (isRunning.value) {
      const text =
        total > 0 ? t('settings.videoFileCheckProgress', { checked, total }) : t('settings.videoFileCheckCounting');

      return { text, type: 'info' };
    }

    if (errorMessage.value) {
      return { text: errorMessage.value, type: 'error' };
    }

    if (finishedAt) {
      const date = new Date(finishedAt).toLocaleString(locale.value, { dateStyle: 'medium', timeStyle: 'short' });

      return { text: t('settings.videoFileCheckFinishedAt', { date }), type: 'success' };
    }

    return { text: t('settings.videoFileCheckNever'), type: 'info' };
  });

  /** Queues the check, then reads the status so progress shows straight away. */
  const startCheck = async (): Promise<void> => {
    isStarting.value = true;

    try {
      await videoFileCheckService.start();
      showSuccessSnackbar(t('settings.videoFileCheckStarted'));
      await refetch();
    } catch (error: unknown) {
      // Another tab or the daily run got there first: nothing went wrong, so just follow that run instead.
      if (isApiErrorCode(error, ApiErrorCode.VideoFileCheckRunning)) {
        await refetch();
        return;
      }

      showAPIErrorSnackbar(error);
    } finally {
      isStarting.value = false;
    }
  };

  watch(status, async (current, previous) => {
    if (!current) {
      return;
    }

    const outcome = getVideoFileCheckOutcome(previous, current);

    if (!outcome) {
      return;
    }

    if (outcome === 'interrupted') {
      showWarningSnackbar(t('settings.videoFileCheckInterrupted'));
    }

    if (outcome === 'finished') {
      showSuccessSnackbar(t('settings.videoFileCheckFinished'));
    }

    // Even a crashed run may have updated some episodes, and cached shows still hold the old flags.
    await queryClient.invalidateQueries(getQueryKeyFilter(ShowQueryKey));
  });

  return { isPending, isRunning, isStarting, startCheck, statusAlert };
};
