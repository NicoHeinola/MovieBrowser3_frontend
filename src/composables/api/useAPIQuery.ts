import type { UseQueryOptions } from '@tanstack/vue-query';

import { useQuery } from '@tanstack/vue-query';
import { watch } from 'vue';
import { useCommonSnackbar } from '../snackbar/useCommonSnackbar';

export const useAPIQuery = <TData = unknown>(options: UseQueryOptions<TData>) => {
  const { showAPIErrorSnackbar } = useCommonSnackbar();

  const query = useQuery<TData>(options);

  watch(query.error, (error) => {
    if (error) {
      showAPIErrorSnackbar(error);
    }
  });

  return query;
};
