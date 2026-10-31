import type { UserSearchFilters } from '@/composables/user/UserSearchFilters';
import type { LocationQuery } from 'vue-router';

import { getQueryString } from '@/utils/route/getQueryString';

/**
 * Reads the user search filters from URL query params, ignoring unknown values.
 * @param query - The route query.
 * @returns The filters.
 */
export const getUserSearchFiltersFromQuery = (query: LocationQuery): UserSearchFilters => {
  const admin = getQueryString(query.admin);

  return {
    admin: admin === '1' ? 'include' : admin === '0' ? 'exclude' : null,
  };
};
