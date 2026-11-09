import { WatchStatus } from '@/enums/show/WatchStatus';

const watchStatusIcons: Record<WatchStatus, string> = {
  [WatchStatus.Watching]: 'mdi-play-circle',
  [WatchStatus.PlanToWatch]: 'mdi-bookmark',
  [WatchStatus.Completed]: 'mdi-check-circle',
  [WatchStatus.OnHold]: 'mdi-pause-circle',
  [WatchStatus.Dropped]: 'mdi-close-circle',
};

/**
 * Resolves the icon that represents a watch status.
 * @param watchStatus - The watch status to look up.
 * @returns The MDI icon name for the status.
 */
export const getWatchStatusIcon = (watchStatus: WatchStatus): string => {
  return watchStatusIcons[watchStatus];
};
