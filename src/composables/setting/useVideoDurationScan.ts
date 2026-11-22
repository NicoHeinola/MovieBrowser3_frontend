import type { VideoDurationScanStatus } from '@/interfaces/api/models/VideoDurationScanStatus';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useVideoFileRunReport } from '@/composables/setting/useVideoFileRunReport';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { DashboardQueryKey } from '@/enums/query/dashboardQueryKey';
import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { VideoDurationScanQueryKey } from '@/enums/query/videoDurationScanQueryKey';
import { videoDurationScanService } from '@/services/show/videoDurationScanService';

/** Which episodes a scan reads; left empty, every episode with a file is read again. */
export interface VideoDurationScanScope {
  /** Reads only these shows' episodes. */
  showIds?: number[];
  /** Reads only the episodes without a length. */
  onlyMissing?: boolean;
}

/** How often the status is read while a scan runs. Lengths read fast, so a scan is often over in seconds. */
const POLL_INTERVAL_MS = 2000;

/**
 * Follows the background episode length scan: reads its status, starts it and reports how it ended. Every page that
 * calls it sees the same scan, whichever page or upload queued it. Call it once per page, because each call shows its
 * own snackbars.
 * @returns The scan state, whether this page follows it, its progress text, the status card and the start action.
 */
export const useVideoDurationScan = () => {
  const isStarting = ref<boolean>(false);
  /** Whether the running scan is one this page started or queued, so a page about one show doesn't show others'. */
  const isFollowing = ref<boolean>(false);

  const { showAPIErrorSnackbar, showSuccessSnackbar, showWarningSnackbar } = useCommonSnackbar();
  const { t } = useI18n();

  const { status, isPending, isRunning, refetch, followStatus, progressText, statusCard } =
    useVideoFileRunReport<VideoDurationScanStatus>({
      queryKey: [VideoDurationScanQueryKey.AdminVideoDurationScanStatus],
      queryFn: () => videoDurationScanService.get(),
      pollIntervalMs: POLL_INTERVAL_MS,
      getCounts: (current) => ({ done: current.read, total: current.total, problems: current.unknown_durations_count }),
      // Shows and the dashboard's total runtime hold the lengths.
      invalidates: [ShowQueryKey, DashboardQueryKey],
      icon: 'mdi-timer-sand',
      problemIcon: 'mdi-timer-alert-outline',
      messages: {
        running: 'settings.durationScanRunning',
        failed: 'settings.durationScanFailed',
        finishedAt: 'settings.durationScanFinishedAt',
        problems: 'settings.durationScanUnknown',
        allGood: 'settings.durationScanAllKnown',
        never: 'settings.durationScanNever',
        finished: 'settings.durationScanFinished',
        finishedProblems: 'settings.durationScanFinishedUnknown',
        interrupted: 'settings.durationScanInterrupted',
      },
    });

  /**
   * Queues episodes for a length read and follows the scan straight away. A running scan takes them too.
   * @param scope - Which episodes to read.
   * @returns Nothing.
   */
  const startScan = async ({ showIds, onlyMissing }: VideoDurationScanScope = {}): Promise<void> => {
    isStarting.value = true;
    isFollowing.value = true;

    // Kept to tell a scan that ended at once from one that never started
    const previousFinishedAt = status.value?.finished_at ?? null;

    try {
      const started = await videoDurationScanService.start({
        ...(showIds ? { show_ids: showIds } : {}),
        ...(onlyMissing ? { only_missing: true } : {}),
      });

      followStatus(started);

      if (started.running) {
        showSuccessSnackbar(t('settings.durationScanStarted'));
      } else if (started.finished_at === previousFinishedAt) {
        // Nothing was queued, such as a show without video files or no missing lengths, so no scan runs
        showWarningSnackbar(t('settings.durationScanNothingToRead'));
      }
      // Otherwise the scan already ended, and the end report says so
    } catch (error: unknown) {
      showAPIErrorSnackbar(error);
    } finally {
      isStarting.value = false;
      // Nothing to follow when no scan runs, such as when there was nothing to read or the start failed
      isFollowing.value = isRunning.value;
    }
  };

  /**
   * Follows a scan this page queued another way, such as by saving uploads: reads the status and keeps following it.
   * @returns Nothing.
   */
  const followQueuedScan = async (): Promise<void> => {
    isFollowing.value = true;
    await refetch();
    // The scan may have ended already, and its end was reported by the read
    isFollowing.value = isRunning.value;
  };

  // A followed scan stops being followed once it ends, so the next one only shows when this page starts it too
  watch(isRunning, (running) => {
    if (!running) {
      isFollowing.value = false;
    }
  });

  return { isFollowing, isPending, isRunning, isStarting, progressText, followQueuedScan, startScan, statusCard };
};
