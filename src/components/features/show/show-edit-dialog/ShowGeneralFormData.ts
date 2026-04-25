import type { Show } from '@/interfaces/api/models/Show';
import type { ShowTitle } from '@/interfaces/api/models/ShowTitle';

export interface ShowGeneralFormData extends Pick<
  Show,
  'banner_url' | 'card_image_url' | 'preview_url' | 'description'
> {
  id?: number;
  titles: {
    id?: number;
  } & Pick<ShowTitle, 'title' | 'is_primary'>[];
}
