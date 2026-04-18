import type { PaginationMeta } from '../models/PaginationMeta';

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
