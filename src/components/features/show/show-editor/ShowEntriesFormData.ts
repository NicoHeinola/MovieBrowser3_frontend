import type { ShowEntryFormData } from './ShowEntryFormData';
import type { ShowTitle } from '@/interfaces/api/models/ShowTitle';

export interface ShowEntriesFormData {
  id?: number;
  /** The show's titles, which an entry's MyAnimeList search starts from. */
  titles?: Pick<ShowTitle, 'title' | 'is_primary'>[];
  entries?: ShowEntryFormData[];
}
