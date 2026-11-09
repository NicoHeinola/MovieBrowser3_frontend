import type { MIXED_WATCH_STATUS } from './mixedWatchStatus';
import type { WatchStatus } from '@/enums/show/WatchStatus';

/** The watch status of several entries combined: a shared status, `mixed`, or null. */
export type CombinedWatchStatus = WatchStatus | typeof MIXED_WATCH_STATUS.value | null;
