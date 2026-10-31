import type { WebsiteTag } from '@/interfaces/api/models/WebsiteTag';
import type { ApiQueryParams } from '@/interfaces/api/requests/ApiQueryParams';
import type { CreateWebsiteTagRequest } from '@/interfaces/api/requests/CreateWebsiteTagRequest';
import type { UpdateWebsiteTagRequest } from '@/interfaces/api/requests/UpdateWebsiteTagRequest';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { apiClient } from '@/plugins/api/apiClient';

const list = async (query: ApiQueryParams): Promise<PaginatedResponse<WebsiteTag>> => {
  const response = await apiClient.get<PaginatedResponse<WebsiteTag>>('website-tags', {
    params: query,
  });

  return response.data;
};

const get = async (websiteTagId: number): Promise<WebsiteTag> => {
  const response = await apiClient.get<WebsiteTag>(`website-tags/${websiteTagId}`);

  return response.data;
};

const create = async (request: CreateWebsiteTagRequest): Promise<WebsiteTag> => {
  const response = await apiClient.post<WebsiteTag>('website-tags', request);

  return response.data;
};

const update = async (websiteTagId: number, request: UpdateWebsiteTagRequest): Promise<WebsiteTag> => {
  const response = await apiClient.patch<WebsiteTag>(`website-tags/${websiteTagId}`, request);

  return response.data;
};

const remove = async (websiteTagId: number): Promise<void> => {
  await apiClient.delete<void>(`website-tags/${websiteTagId}`);
};

export const websiteTagService = {
  list,
  get,
  create,
  update,
  remove,
};
