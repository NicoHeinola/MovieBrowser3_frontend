import type { EpisodeFormData } from './EpisodeFormData';
import type { ShowEntryType } from '@/enums/show/ShowEntryType';

export interface ShowEntryFormData {
  id?: number;
  type: ShowEntryType;
  name: string;
  sort_order: number;
  episodes?: EpisodeFormData[];
}
