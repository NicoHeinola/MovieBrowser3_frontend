import { WatchStatus } from '@/enums/show/WatchStatus';

const watchStatusColors: Record<WatchStatus, string> = {
  [WatchStatus.Watching]: 'watch-status-watching',
  [WatchStatus.PlanToWatch]: 'watch-status-plan-to-watch',
  [WatchStatus.Completed]: 'watch-status-completed',
  [WatchStatus.OnHold]: 'watch-status-on-hold',
  [WatchStatus.Dropped]: 'watch-status-dropped',
};

/**
 * Resolves the theme color that represents a watch status.
 * @param watchStatus - The watch status to look up.
 * @returns The Vuetify theme color name for the status.
 */
export const getWatchStatusColor = (watchStatus: WatchStatus): string => {
  return watchStatusColors[watchStatus];
};
