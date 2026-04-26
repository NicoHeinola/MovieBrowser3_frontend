import type { ShowEntryType } from '@/enums/show/ShowEntryType';

export interface EpisodeFormData {
  id?: number;
  name: string;
}

export interface ShowEntryFormData {
  id?: number;
  type: ShowEntryType;
  name: string;
  sort_order: number;
  episodes?: EpisodeFormData[];
}

export interface ShowEntriesFormData {
  id?: number;
  entries?: ShowEntryFormData[];
}
