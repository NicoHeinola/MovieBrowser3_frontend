import type { ShowTitle } from '@/interfaces/api/models/ShowTitle';
import type { CreateShowTitleRequest } from '@/interfaces/api/requests/CreateShowTitleRequest';
import type { ListShowTitlesRequest } from '@/interfaces/api/requests/ListShowTitlesRequest';
import type { UpdateShowTitleRequest } from '@/interfaces/api/requests/UpdateShowTitleRequest';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { apiClient } from '@/plugins/api/apiClient';

const list = async (showId: number, query?: ListShowTitlesRequest): Promise<PaginatedResponse<ShowTitle>> => {
  const response = await apiClient.get<PaginatedResponse<ShowTitle>>(`shows/${showId}/titles`, {
    params: query,
  });

  return response.data;
};

const get = async (titleId: number): Promise<ShowTitle> => {
  const response = await apiClient.get<ShowTitle>(`titles/${titleId}`);

  return response.data;
};

const create = async (showId: number, request: CreateShowTitleRequest): Promise<ShowTitle> => {
  const response = await apiClient.post<ShowTitle>(`shows/${showId}/titles`, request);

  return response.data;
};

const update = async (titleId: number, request: UpdateShowTitleRequest): Promise<ShowTitle> => {
  const response = await apiClient.patch<ShowTitle>(`titles/${titleId}`, request);

  return response.data;
};

const remove = async (titleId: number): Promise<void> => {
  await apiClient.delete(`titles/${titleId}`);
};

export const showTitleService = {
  list,
  get,
  create,
  update,
  remove,
};
