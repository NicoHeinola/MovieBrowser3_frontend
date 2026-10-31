import type { Website } from '@/interfaces/api/models/Website';
import type { ApiQueryParams } from '@/interfaces/api/requests/ApiQueryParams';
import type { CreateWebsiteRequest } from '@/interfaces/api/requests/CreateWebsiteRequest';
import type { UpdateWebsiteRequest } from '@/interfaces/api/requests/UpdateWebsiteRequest';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { apiClient } from '@/plugins/api/apiClient';

const list = async (query: ApiQueryParams): Promise<PaginatedResponse<Website>> => {
  const response = await apiClient.get<PaginatedResponse<Website>>('websites', {
    params: query,
  });

  return response.data;
};

const get = async (websiteId: number): Promise<Website> => {
  const response = await apiClient.get<Website>(`websites/${websiteId}`);

  return response.data;
};

const create = async (request: CreateWebsiteRequest): Promise<Website> => {
  const response = await apiClient.post<Website>('websites', request);

  return response.data;
};

const update = async (websiteId: number, request: UpdateWebsiteRequest): Promise<Website> => {
  const response = await apiClient.patch<Website>(`websites/${websiteId}`, request);

  return response.data;
};

const remove = async (websiteId: number): Promise<void> => {
  await apiClient.delete<void>(`websites/${websiteId}`);
};

export const websiteService = {
  list,
  get,
  create,
  update,
  remove,
};
