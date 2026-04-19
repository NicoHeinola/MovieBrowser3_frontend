import type { ShowLinkType } from '@/enums/show/ShowLinkType';

export interface ShowLink {
  id: number;
  source_show_id: number;
  target_show_id: number;
  type: ShowLinkType;
}
