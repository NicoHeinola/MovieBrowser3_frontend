import type { ApiQueryParams } from '@/interfaces/api/requests/ApiQueryParams';

/**
 * Builds the backend query for one view of the server-side tags table.
 * @param searchTerm - Words the tag name must all contain, ignoring case. Blank lists every tag.
 * @param page - The 1-based page.
 * @param itemsPerPage - Rows per page, or -1 for every tag on one page.
 * @param sortBy - The table's sort, of which only `name` is sortable on the backend.
 * @returns The list query.
 */
export const getWebsiteTagListQuery = (
  searchTerm: string,
  page: number,
  itemsPerPage: number,
  sortBy: Array<{ key: string; order?: boolean | 'asc' | 'desc' }>,
): ApiQueryParams => {
  const term = searchTerm.trim();
  const isDescending = sortBy.find((sort) => sort.key === 'name')?.order === 'desc';
  const showsAll = itemsPerPage <= 0;

  return {
    ...(term ? { filter: { search: term } } : {}),
    sort: isDescending ? '-name' : 'name',
    page: showsAll ? { number: 0, size: 0 } : { number: page, size: itemsPerPage },
  };
};
