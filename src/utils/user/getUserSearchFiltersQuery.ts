import type { UserSearchFilters } from '@/composables/user/UserSearchFilters';
import type { LocationQueryRaw } from 'vue-router';

/**
 * Writes the user search filters as URL query params.
 * @param filters - The selected filters.
 * @returns The query params of the filters that are set.
 */
export const getUserSearchFiltersQuery = (filters: UserSearchFilters): LocationQueryRaw => {
  const query: LocationQueryRaw = {};

  if (filters.admin !== null) {
    query.admin = filters.admin === 'include' ? '1' : '0';
  }

  return query;
};
