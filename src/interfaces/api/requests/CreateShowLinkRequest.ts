import type { ShowLinkType } from '@/enums/show/ShowLinkType';

export interface CreateShowLinkRequest {
  target_show_id: number;
  type: ShowLinkType;
}
