import type { UserSearchFilters } from '@/composables/user/UserSearchFilters';

/**
 * Builds the backend `filter` query params for a user search.
 * @param searchTerm - The trimmed search term, matched as part of the username, or an empty string for none.
 * @param filters - The selected filters.
 * @returns The filter params, or undefined when nothing filters the search.
 */
export const getUserSearchFilterParams = (
  searchTerm: string,
  filters: UserSearchFilters,
): Record<string, string | string[]> | undefined => {
  const params: Record<string, string | string[]> = {};

  if (searchTerm) {
    params.username = searchTerm;
  }

  if (filters.admin !== null) {
    params.is_admin = filters.admin === 'include' ? '1' : '0';
  }

  return Object.keys(params).length > 0 ? params : undefined;
};
