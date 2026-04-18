import { QueryClient } from '@tanstack/vue-query';

import { getEnvNumber } from '@/utils/env/getEnvNumber';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: getEnvNumber('VITE_API_CACHE_STALE_TIME_MS'),
      retry: false,
    },
  },
});
