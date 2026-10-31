import type { FilterChipState } from '@/components/common/filter-chip';

/** Filters the user search applies on top of the search term. */
export interface UserSearchFilters {
  /** Include lists only admins, exclude lists only regular users. */
  admin: FilterChipState;
}
