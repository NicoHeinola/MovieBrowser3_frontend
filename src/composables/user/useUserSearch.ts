import type { UserSearchFilters } from './UserSearchFilters';
import type { User } from '@/interfaces/api/models/User';

import { usePaginatedSearch } from '@/composables/search/usePaginatedSearch';
import { UserQueryKey } from '@/enums/query/userQueryKey';
import { userService } from '@/services/user/userService';
import { getUserSearchFilterParams } from '@/utils/user/getUserSearchFilterParams';
import { getUserSearchFiltersFromQuery } from '@/utils/user/getUserSearchFiltersFromQuery';
import { getUserSearchFiltersQuery } from '@/utils/user/getUserSearchFiltersQuery';
import { userSortOptions } from './userSortOptions';

/**
 * Debounced, paginated user search for the admin users page, kept in the URL query.
 *
 * @returns The search input, filter, sort and page refs, the query, and the users.
 */
export const useUserSearch = () => {
  const { items, ...search } = usePaginatedSearch<User, UserSearchFilters>({
    queryKey: UserQueryKey.AdminUsers,
    list: userService.list,
    createEmptyFilters: () => ({ admin: null }),
    getFilterParams: getUserSearchFilterParams,
    countActiveFilters: (filters) => (filters.admin === null ? 0 : 1),
    defaultSort: userSortOptions[0].value,
    pageSize: 25,
    routeQuery: {
      sortValues: userSortOptions.map((option) => option.value),
      getFiltersQuery: getUserSearchFiltersQuery,
      getFiltersFromQuery: getUserSearchFiltersFromQuery,
    },
  });

  return {
    ...search,
    users: items,
  };
};
