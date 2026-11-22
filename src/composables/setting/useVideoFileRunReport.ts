import type { TaskStatus } from '@/components/common/task-status-card';
import type { VideoFileRunOptions } from '@/composables/setting/useVideoFileRun';
import type { VideoFileRunOutcome, VideoFileRunStatus } from '@/utils/show/video-file/getVideoFileRunOutcome';
import { useQueryClient } from '@tanstack/vue-query';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useVideoFileRun } from '@/composables/setting/useVideoFileRun';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { getApiErrorDetailMessage } from '@/utils/api/getApiErrorDetailMessage';
import { getQueryKeyFilter } from '@/utils/query/getQueryKeyFilter';
import { formatDateTime } from '@/utils/time/formatDateTime';

/** How far a run through the episodes is, and how many of their files it couldn't handle. */
export interface VideoFileRunCounts {
  done: number;
  total: number;
  /** Such as missing files for the file check, or episodes without a length for the length scan. */
  problems: number;
}

/** The i18n keys of one run's texts. */
export interface VideoFileRunReportMessages {
  /** Card title while a run goes. */
  running: string;
  /** Card title after a failed run. */
  failed: string;
  /** Card title after a finished run, with `{date}`. */
  finishedAt: string;
  /** Card text when some files had a problem, plural with `{count}`. */
  problems: string;
  /** Card text when every file was fine. */
  allGood: string;
  /** Card title before the first run. */
  never: string;
  /** Snackbar when a run finishes with every file fine. */
  finished: string;
  /** Snackbar when a run finishes with problems, plural with `{count}`. */
  finishedProblems: string;
  /** Snackbar when a run's worker died. */
  interrupted: string;
}

/** What differs between the runs that `useVideoFileRunReport` reports. */
export interface VideoFileRunReportOptions<T extends VideoFileRunStatus> extends Omit<VideoFileRunOptions<T>, 'onEnd'> {
  /** Reads the counts from a status. */
  getCounts: (status: T) => VideoFileRunCounts;
  /** Query key enums whose cached data a run changes, such as `ShowQueryKey`. Refreshed after every end. */
  invalidates: Record<string, string>[];
  /** The card icon while a run goes and before the first one. */
  icon: string;
  /** The card icon after a failed run, or one with problems. */
  problemIcon: string;
  messages: VideoFileRunReportMessages;
}

/**
 * Follows a background run that goes through every queued episode's video file and ends with a count of the files it
 * couldn't handle, such as the file check and the length scan. Builds the status card and reports each end with a
 * snackbar. Call it once per page, because each call shows its own snackbars.
 * @param options - The run's status query and texts.
 * @returns The run state from `useVideoFileRun`, plus its progress text and status card.
 */
export const useVideoFileRunReport = <T extends VideoFileRunStatus>(options: VideoFileRunReportOptions<T>) => {
  const { messages } = options;

  const queryClient = useQueryClient();
  const { showErrorSnackbar, showSuccessSnackbar, showWarningSnackbar } = useCommonSnackbar();
  const { t } = useI18n();

  /**
   * Tells the admin how a run ended and refreshes what it changed.
   * @param current - The status after the run ended.
   * @param outcome - How it ended.
   * @returns Nothing.
   */
  const reportEnd = async (current: T, outcome: VideoFileRunOutcome): Promise<void> => {
    if (outcome === 'interrupted') {
      showWarningSnackbar(t(messages.interrupted));
    }

    // Such as an unreachable video folder, which the backend reports on the run instead of refusing the start.
    if (outcome === 'failed' && current.error) {
      showErrorSnackbar(getApiErrorDetailMessage(current.error));
    }

    if (outcome === 'finished') {
      const { problems: count } = options.getCounts(current);

      if (count > 0) {
        showWarningSnackbar(t(messages.finishedProblems, { count }, count));
      } else {
        showSuccessSnackbar(t(messages.finished));
      }
    }

    // Even a failed run may have changed some episodes, and the cache still holds their old values.
    await queryClient.invalidateQueries(getQueryKeyFilter(...options.invalidates));
  };

  const run = useVideoFileRun<T>({
    queryKey: options.queryKey,
    queryFn: options.queryFn,
    pollIntervalMs: options.pollIntervalMs,
    onEnd: reportEnd,
  });
  const { status, isError, isRunning } = run;

  /** The counts of the last read status, all 0 before the first one. */
  const counts = computed<VideoFileRunCounts>(() =>
    status.value ? options.getCounts(status.value) : { done: 0, total: 0, problems: 0 },
  );

  /** How far the running run is, as `12 of 40 episodes`, or null while none runs. */
  const progressText = computed<string | null>(() => {
    if (!isRunning.value) {
      return null;
    }

    const { done, total } = counts.value;

    return total > 0 ? t('settings.episodeProgress', { done, total }) : t('settings.countingEpisodes');
  });

  /** The status card. A run in progress goes first, because the last run's result stays set during a new one. */
  const statusCard = computed<TaskStatus>(() => {
    // The status is unknown, so neither an old result nor "never run" would be true.
    if (isError.value) {
      return { type: 'error', icon: 'mdi-alert-circle-outline', title: t('apiErrors.generic') };
    }

    const { done, total, problems } = counts.value;
    const { error = null, finished_at: finishedAt = null } = status.value ?? {};

    if (isRunning.value) {
      return {
        type: 'info',
        icon: options.icon,
        title: t(messages.running),
        running: true,
        progress: total > 0 ? Math.round((done / total) * 100) : null,
        progressText: progressText.value ?? undefined,
      };
    }

    if (error) {
      return {
        type: 'error',
        icon: options.problemIcon,
        title: t(messages.failed),
        text: getApiErrorDetailMessage(error),
      };
    }

    if (finishedAt) {
      const title = t(messages.finishedAt, { date: formatDateTime(finishedAt) });

      if (problems > 0) {
        const text = t(messages.problems, { count: problems }, problems);

        return { type: 'warning', icon: options.problemIcon, title, text };
      }

      return { type: 'success', icon: 'mdi-check-circle-outline', title, text: t(messages.allGood) };
    }

    return { type: 'info', icon: options.icon, title: t(messages.never) };
  });

  return { ...run, progressText, statusCard };
};
