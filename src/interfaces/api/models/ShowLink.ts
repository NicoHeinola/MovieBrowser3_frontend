import type { Show } from './Show';
import type { ShowLinkType } from '@/enums/show/ShowLinkType';

export interface ShowLink {
  id: number;
  source_show_id: number;
  target_show_id: number;
  type: ShowLinkType;

  target_show?: Show;
  source_show?: Show;
}
