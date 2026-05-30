import type { Show } from '@/interfaces/api/models/Show';
import type { ApiQueryParams } from '@/interfaces/api/requests/ApiQueryParams';
import type { CreateShowRequest } from '@/interfaces/api/requests/CreateShowRequest';
import type { UpdateShowRequest } from '@/interfaces/api/requests/UpdateShowRequest';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { apiClient } from '@/plugins/api/apiClient';

const list = async (query: ApiQueryParams): Promise<PaginatedResponse<Show>> => {
  const response = await apiClient.get<PaginatedResponse<Show>>('shows', {
    params: query,
  });

  return response.data;
};

const get = async (showId: number): Promise<Show> => {
  const response = await apiClient.get<Show>(`shows/${showId}`);

  return response.data;
};

const create = async (request: CreateShowRequest): Promise<Show> => {
  const response = await apiClient.post<Show>('shows', request);

  return response.data;
};

const update = async (showId: number, request: UpdateShowRequest): Promise<Show> => {
  const response = await apiClient.patch<Show>(`shows/${showId}`, request);

  return response.data;
};

export const showService = {
  list,
  get,
  create,
  update,
};
