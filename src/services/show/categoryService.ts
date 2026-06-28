import type { Category } from '@/interfaces/api/models/Category';
import type { ApiQueryParams } from '@/interfaces/api/requests/ApiQueryParams';
import type { CreateCategoryRequest } from '@/interfaces/api/requests/CreateCategoryRequest';
import type { UpdateCategoryRequest } from '@/interfaces/api/requests/UpdateCategoryRequest';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { apiClient } from '@/plugins/api/apiClient';

const list = async (query: ApiQueryParams): Promise<PaginatedResponse<Category>> => {
  const response = await apiClient.get<PaginatedResponse<Category>>('categories', {
    params: query,
  });

  return response.data;
};

const get = async (categoryId: number): Promise<Category> => {
  const response = await apiClient.get<Category>(`categories/${categoryId}`);

  return response.data;
};

const create = async (request: CreateCategoryRequest): Promise<Category> => {
  const response = await apiClient.post<Category>('categories', request);

  return response.data;
};

const update = async (categoryId: number, request: UpdateCategoryRequest): Promise<Category> => {
  const response = await apiClient.patch<Category>(`categories/${categoryId}`, request);

  return response.data;
};

const remove = async (categoryId: number): Promise<void> => {
  await apiClient.delete<void>(`categories/${categoryId}`);
};

export const categoryService = {
  list,
  get,
  create,
  update,
  remove,
};
