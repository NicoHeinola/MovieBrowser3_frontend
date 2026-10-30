import type { WatchStatus } from '@/enums/show/WatchStatus';

export interface ShowEntryWatchStatus {
  show_entry_id: number;
  status: WatchStatus;
}
