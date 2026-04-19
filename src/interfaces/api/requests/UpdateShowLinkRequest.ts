import type { ShowLinkType } from '@/enums/show/ShowLinkType';

export interface UpdateShowLinkRequest {
  target_show_id: number;
  type: ShowLinkType;
}
