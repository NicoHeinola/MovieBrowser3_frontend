import type { Query } from '@tanstack/vue-query';

/**
 * Builds a query filter that matches every query keyed by a member of the given query key enums, such as every show
 * list. It works in `invalidateQueries`, `setQueriesData`, `getQueriesData` and `getQueryCache().findAll`.
 * @param queryKeyEnums - Query key enums such as `ShowQueryKey`; a query matches when its first key part is a member.
 * @returns The filter.
 */
export const getQueryKeyFilter = (
  ...queryKeyEnums: Record<string, string>[]
): { predicate: (query: Query) => boolean } => {
  const queryKeys = new Set<unknown>(queryKeyEnums.flatMap((queryKeyEnum) => Object.values(queryKeyEnum)));

  return {
    predicate: (query: Query): boolean => queryKeys.has(query.queryKey[0]),
  };
};
