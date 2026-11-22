import type { EpisodeFormData } from './EpisodeFormData';
import type { ShowEntryType } from '@/enums/show/ShowEntryType';

export interface ShowEntryFormData {
  id?: number;
  type: ShowEntryType;
  name: string;
  /** An outside page about this entry, such as its MyAnimeList page. */
  url?: string | null;
  sort_order: number;
  episodes?: EpisodeFormData[];
}
