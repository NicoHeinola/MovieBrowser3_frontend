import type { ShowEntryType } from '@/enums/show/ShowEntryType';

export interface CreateShowEntryRequest {
  type: ShowEntryType;
  name: string;
  url?: string | null;
  sort_order: number;
}
