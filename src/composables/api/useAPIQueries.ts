import type { QueryObserverResult, UseQueryOptions } from '@tanstack/vue-query';
import type { Ref } from 'vue';

import { useQueries } from '@tanstack/vue-query';
import { watch } from 'vue';
import { useCommonSnackbar } from '../snackbar/useCommonSnackbar';

/**
 * `useAPIQuery` for a list of queries that changes with its inputs, such as one per id: each failure shows the same
 * error snackbar.
 * @param queries - Builds the queries' options, read again whenever what it uses changes.
 * @returns The queries' results, in the same order.
 */
export const useAPIQueries = <TData = unknown>(
  queries: () => UseQueryOptions<TData>[],
): Readonly<Ref<QueryObserverResult<TData>[]>> => {
  const { showAPIErrorSnackbar } = useCommonSnackbar();

  // useQueries types each query from a tuple, which a list of one generic type can't satisfy; the casts only restate it
  const results = useQueries({
    queries: queries as Parameters<typeof useQueries>[0]['queries'],
  }) as Readonly<Ref<QueryObserverResult<TData>[]>>;

  // Only the errors that weren't there before: any query's change runs this again. A failed refetch is a new error
  // though, so a query that polls must stop once it fails (`getPollInterval`).
  watch(
    () => results.value.map((result) => result.error),
    (errors, previousErrors) => {
      for (const error of errors.filter((error) => error && !previousErrors?.includes(error))) {
        showAPIErrorSnackbar(error);
      }
    },
  );

  return results;
};
