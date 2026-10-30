import { WatchStatus } from '@/enums/show/WatchStatus';

const watchStatusColors: Record<WatchStatus, string> = {
  [WatchStatus.Watching]: 'info',
  [WatchStatus.PlanToWatch]: 'link',
  [WatchStatus.Completed]: 'success',
  [WatchStatus.OnHold]: 'warning',
  [WatchStatus.Dropped]: 'error',
};

/**
 * Resolves the theme color that represents a watch status.
 * @param watchStatus - The watch status to look up.
 * @returns The Vuetify theme color name for the status.
 */
export const getWatchStatusColor = (watchStatus: WatchStatus): string => {
  return watchStatusColors[watchStatus];
};
