import type { Show } from '@/interfaces/api/models/Show';
import type { ShowTitle } from '@/interfaces/api/models/ShowTitle';

export interface ShowGeneralFormData extends Pick<Show, 'description'> {
  id?: number;
  titles: {
    id?: number;
  } & Pick<ShowTitle, 'title' | 'is_primary'>[];
}
