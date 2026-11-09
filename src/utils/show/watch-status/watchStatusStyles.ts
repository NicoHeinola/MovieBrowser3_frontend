import { WatchStatus } from '@/enums/show/WatchStatus';

/** How each watch status looks: its theme color and its MDI icon. */
export const WATCH_STATUS_STYLES: Record<WatchStatus, { color: string; icon: string }> = {
  [WatchStatus.Watching]: { color: 'watch-status-watching', icon: 'mdi-play-circle' },
  [WatchStatus.PlanToWatch]: { color: 'watch-status-plan-to-watch', icon: 'mdi-bookmark' },
  [WatchStatus.Completed]: { color: 'watch-status-completed', icon: 'mdi-check-circle' },
  [WatchStatus.OnHold]: { color: 'watch-status-on-hold', icon: 'mdi-pause-circle' },
  [WatchStatus.Dropped]: { color: 'watch-status-dropped', icon: 'mdi-close-circle' },
};
