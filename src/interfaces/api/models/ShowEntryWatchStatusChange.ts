import type { WatchStatus } from '@/enums/show/WatchStatus';

/** A streamed watch status change of one show entry, whatever caused it. */
export interface ShowEntryWatchStatusChange {
  show_id: number;
  show_entry_id: number;
  status: WatchStatus | null; // null when the entry's status was cleared
}
