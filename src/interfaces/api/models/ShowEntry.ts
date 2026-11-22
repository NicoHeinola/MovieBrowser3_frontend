import type { Episode } from './Episode';
import type { ShowEntryWatchStatus } from './ShowEntryWatchStatus';
import type { ShowEntryType } from '@/enums/show/ShowEntryType';

export interface ShowEntry {
  id: number;
  show_id: number;
  type: ShowEntryType;
  name: string;
  /** An outside page about this entry, such as its MyAnimeList page. */
  url: string | null;
  sort_order: number;
  episodes?: Episode[];
  watch_status?: ShowEntryWatchStatus | null;
}
