import type { User } from '@/interfaces/api/models/User';
import type { UserSearchFilters } from '@/interfaces/user/UserSearchFilters';

import { usePaginatedSearch } from '@/composables/search/usePaginatedSearch';
import { userSearchFilterDefinitions } from '@/data/user/userSearchFilterDefinitions';
import { userSortOptions } from '@/data/user/userSortOptions';
import { UserQueryKey } from '@/enums/query/userQueryKey';
import { userService } from '@/services/user/userService';
import { createSearchFilters } from '@/utils/filter/createSearchFilters';

/**
 * Debounced, paginated user search for the admin users page, kept in the URL query.
 *
 * @returns The search input, filter, sort and page refs, the query, and the users.
 */
export const useUserSearch = () => {
  const { routeQuery, ...filterOptions } = createSearchFilters<UserSearchFilters>(
    userSearchFilterDefinitions,
    'username',
  );

  const { items, ...search } = usePaginatedSearch<User, UserSearchFilters>({
    queryKey: UserQueryKey.AdminUsers,
    list: userService.list,
    ...filterOptions,
    defaultSort: userSortOptions[0].value,
    pageSize: 25,
    routeQuery: {
      ...routeQuery,
      sortValues: userSortOptions.map((option) => option.value),
    },
  });

  return {
    ...search,
    users: items,
  };
};
