import type { User } from '@/interfaces/api/models/User';
import type { ApiQueryParams } from '@/interfaces/api/requests/ApiQueryParams';
import type { CreateUserRequest } from '@/interfaces/api/requests/CreateUserRequest';
import type { UpdateUserRequest } from '@/interfaces/api/requests/UpdateUserRequest';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { apiClient } from '@/plugins/api/apiClient';

const list = async (query: ApiQueryParams): Promise<PaginatedResponse<User>> => {
  const response = await apiClient.get<PaginatedResponse<User>>('users', {
    params: query,
  });

  return response.data;
};

const get = async (userId: number): Promise<User> => {
  const response = await apiClient.get<User>(`users/${userId}`);

  return response.data;
};

const create = async (request: CreateUserRequest): Promise<User> => {
  const response = await apiClient.post<User>('users', request);

  return response.data;
};

const update = async (userId: number, request: UpdateUserRequest): Promise<User> => {
  const response = await apiClient.patch<User>(`users/${userId}`, request);

  return response.data;
};

const remove = async (userId: number): Promise<void> => {
  await apiClient.delete<void>(`users/${userId}`);
};

export const userService = {
  list,
  get,
  create,
  update,
  remove,
};
