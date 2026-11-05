import type { ChipsFilterValue } from '@/composables/search/ChipsFilterValue';

/** Filters the user search applies on top of the search term. */
export interface UserSearchFilters {
  /** Including `admin` lists only admins, excluding it lists only regular users. */
  role: ChipsFilterValue;
}
