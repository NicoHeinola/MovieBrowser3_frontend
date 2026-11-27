import type { BackgroundRunStatus } from '@/interfaces/api/models/BackgroundRunStatus';
import type { ApiErrorDetail } from '@/interfaces/api/responses/ApiErrorDetail';
import type { BackgroundRunOutcome } from '@/utils/background-run/getBackgroundRunOutcome';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { getBackgroundRunOutcome } from '@/utils/background-run/getBackgroundRunOutcome';
import { getPollInterval } from '@/utils/query/getPollInterval';

/** How `useBackgroundRun` reads a run, and what it tells the admin when the run ends. */
export interface BackgroundRunOptions<T extends BackgroundRunStatus> {
  /** The status query's key. */
  queryKey: readonly string[];
  /** Reads the run's status. */
  queryFn: () => Promise<T>;
  /** How often the status is read while a run is in progress. */
  pollIntervalMs: number;
  /** Tells the admin what a finished run did. */
  reportFinished: (current: T) => void;
  /** Gives the message for a failed run. */
  getErrorMessage: (error: ApiErrorDetail) => string;
  /** The i18n key of the warning for a run whose worker stopped without a report. */
  interruptedMessageKey: string;
  /** Reads again the data that a run changes. It runs after every end, because a failed run can change data too. */
  refreshChangedData: () => Promise<unknown>;
}

/**
 * Follows a background run on the backend, such as the video file check or the video base folder move. It reads the
 * status, polls while a run is in progress, and tells the admin once when a run ends. Call it once per page, because
 * each call shows its own snackbars.
 * @param options - The status query and what to report.
 * @returns The status, whether a run is in progress, and `followStatus` for a status that a start request returned.
 */
export const useBackgroundRun = <T extends BackgroundRunStatus>(options: BackgroundRunOptions<T>) => {
  const queryClient = useQueryClient();
  const { showAPIErrorSnackbar, showErrorSnackbar, showWarningSnackbar } = useCommonSnackbar();
  const { t } = useI18n();

  const query = useAPIQuery<T>({
    queryKey: options.queryKey,
    queryFn: options.queryFn,
    // A run can start or end while this page is closed, so read it on each visit.
    staleTime: 0,
    // Poll only during a run, so an idle page sends no requests
    refetchInterval: (current) => getPollInterval(current.state, (status) => status.running, options.pollIntervalMs),
  });

  /** The status the next one is compared with. Starts from a cached status, so a run seen going on an earlier visit
   * still gets its end reported. */
  let lastSeenStatus: BackgroundRunStatus | undefined = query.data.value;

  /** Whether a run is in progress. After a failed read, the last answer is not trusted, so a start stays possible. */
  const isRunning = computed<boolean>(() => !query.isError.value && (query.data.value?.running ?? false));

  /**
   * Tells the admin how a run ended, and reads again what it changed.
   * @param current - The status after the run ended.
   * @param outcome - How it ended.
   * @returns Nothing.
   */
  const reportEnd = async (current: T, outcome: BackgroundRunOutcome): Promise<void> => {
    if (outcome === 'finished') {
      options.reportFinished(current);
    }

    // A failed run always has its error. The check only tells TypeScript.
    if (outcome === 'failed' && current.error) {
      showErrorSnackbar(options.getErrorMessage(current.error));
    }

    if (outcome === 'interrupted') {
      showWarningSnackbar(t(options.interruptedMessageKey));
    }

    try {
      await options.refreshChangedData();
    } catch (error: unknown) {
      showAPIErrorSnackbar(error);
    }
  };

  /**
   * Shows the status that a start request returned, without a wait for the next read.
   * @param startedStatus - The returned status.
   * @returns Nothing.
   */
  const followStatus = async (startedStatus: T): Promise<void> => {
    // A read that began before the start would bring back the old idle status, and the run would look as if it stopped
    await queryClient.cancelQueries({ queryKey: options.queryKey });
    queryClient.setQueryData(options.queryKey, startedStatus);
  };

  watch(query.data, async (current?: T) => {
    if (!current) {
      return;
    }

    const previousStatus = lastSeenStatus;

    lastSeenStatus = current;

    const outcome = getBackgroundRunOutcome(previousStatus, current);

    if (outcome) {
      await reportEnd(current, outcome);
    }
  });

  return {
    status: query.data,
    isError: query.isError,
    isPending: query.isPending,
    refetch: query.refetch,
    isRunning,
    followStatus,
  };
};
