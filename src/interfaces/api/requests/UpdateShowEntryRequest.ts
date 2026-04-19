import type { ShowEntryType } from '@/enums/show/ShowEntryType';

export interface UpdateShowEntryRequest {
  type: ShowEntryType;
  name: string;
  sort_order: number;
}
