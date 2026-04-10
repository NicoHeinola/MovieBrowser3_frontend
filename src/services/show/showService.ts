import type { Show } from '@/interfaces/api/models/Show';
import type { ApiQueryParams } from '@/interfaces/api/requests/ApiQueryParams';

import { apiClient } from '@/plugins/api/apiClient';

const list = async (query: ApiQueryParams): Promise<Show[]> => {
  const response = await apiClient.get<Show[]>('shows', {
    params: query,
  });

  return response.data;
};

export const showService = {
  list,
};
