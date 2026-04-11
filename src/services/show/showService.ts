import type { Show } from '@/interfaces/api/models/Show';
import type { ApiQueryParams } from '@/interfaces/api/requests/ApiQueryParams';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { apiClient } from '@/plugins/api/apiClient';

const list = async (query: ApiQueryParams): Promise<PaginatedResponse<Show>> => {
  const response = await apiClient.get<PaginatedResponse<Show>>('shows', {
    params: query,
  });

  return response.data;
};

export const showService = {
  list,
};
