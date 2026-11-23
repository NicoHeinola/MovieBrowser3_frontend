import type { VideoFileRunOutcome, VideoFileRunStatus } from '@/utils/show/video-file/getVideoFileRunOutcome';
import { useQueryClient } from '@tanstack/vue-query';
import { computed, watch } from 'vue';

import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { getPollInterval } from '@/utils/query/getPollInterval';
import { getVideoFileRunOutcome } from '@/utils/show/video-file/getVideoFileRunOutcome';

/** How `useVideoFileRun` reads a run and what it does when one ends. */
export interface VideoFileRunOptions<T extends VideoFileRunStatus> {
  /** The status query's key. */
  queryKey: readonly string[];
  /** Reads the run's status. */
  queryFn: () => Promise<T>;
  /** How often the status is read while a run goes. */
  pollIntervalMs: number;
  /** Reports a run that ended while this page followed it, or one this page started. */
  onEnd: (current: T, outcome: VideoFileRunOutcome) => Promise<void> | void;
}

/**
 * Follows a background video file run, such as the file check or the folder move: reads its status, polls while it
 * goes and calls `onEnd` once when it ends.
 * @param options - The status query and the end handler.
 * @returns The status, whether a run is known to go, and `followStatus` for a status a start request returned.
 */
export const useVideoFileRun = <T extends VideoFileRunStatus>(options: VideoFileRunOptions<T>) => {
  const queryClient = useQueryClient();

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
  let lastSeen: VideoFileRunStatus | undefined = query.data.value;

  /** Whether a run is known to go. After a failed read the last answer can't be trusted, so starting stays usable. */
  const isRunning = computed<boolean>(() => !query.isError.value && (query.data.value?.running ?? false));

  /**
   * Follows a status a start request returned, without waiting for the next read.
   * @param started - The returned status.
   * @returns Nothing.
   */
  const followStatus = (started: T): void => {
    // Before the first read there is nothing to compare with, so a run that ended at once would go unreported. Compare
    // it with an idle run instead: the new finish time then reads as an end.
    lastSeen ??= { running: false, finished_at: null, error: null };
    queryClient.setQueryData(options.queryKey, started);
  };

  watch(query.data, async (current?: T) => {
    if (!current) {
      return;
    }

    const previous = lastSeen;

    lastSeen = current;

    const outcome = getVideoFileRunOutcome(previous, current);

    if (outcome) {
      await options.onEnd(current, outcome);
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
