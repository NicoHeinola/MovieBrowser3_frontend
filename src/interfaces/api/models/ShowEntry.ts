import type { Episode } from './Episode';
import type { ShowEntryType } from '@/enums/show/ShowEntryType';

export interface ShowEntry {
  id: number;
  show_id: number;
  type: ShowEntryType;
  name: string;
  sort_order: number;
  episodes?: Episode[];
}
