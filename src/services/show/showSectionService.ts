import type { ShowSection } from '@/interfaces/api/models/ShowSection';
import type { ApiQueryParams } from '@/interfaces/api/requests/ApiQueryParams';
import type { CreateShowSectionRequest } from '@/interfaces/api/requests/CreateShowSectionRequest';
import type { UpdateShowSectionRequest } from '@/interfaces/api/requests/UpdateShowSectionRequest';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { apiClient } from '@/plugins/api/apiClient';

const list = async (query: ApiQueryParams): Promise<PaginatedResponse<ShowSection>> => {
  const response = await apiClient.get<PaginatedResponse<ShowSection>>('show-sections', {
    params: query,
  });

  return response.data;
};

const get = async (showSectionId: number): Promise<ShowSection> => {
  const response = await apiClient.get<ShowSection>(`show-sections/${showSectionId}`);

  return response.data;
};

const create = async (request: CreateShowSectionRequest): Promise<ShowSection> => {
  const response = await apiClient.post<ShowSection>('show-sections', request);

  return response.data;
};

const update = async (showSectionId: number, request: UpdateShowSectionRequest): Promise<ShowSection> => {
  const response = await apiClient.patch<ShowSection>(`show-sections/${showSectionId}`, request);

  return response.data;
};

const remove = async (showSectionId: number): Promise<void> => {
  await apiClient.delete<void>(`show-sections/${showSectionId}`);
};

export const showSectionService = {
  list,
  get,
  create,
  update,
  remove,
};
