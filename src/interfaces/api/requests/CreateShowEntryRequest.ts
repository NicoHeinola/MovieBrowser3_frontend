import type { ShowEntryType } from '@/enums/show/ShowEntryType';

export interface CreateShowEntryRequest {
  type: ShowEntryType;
  name: string;
  sort_order: number;
}
