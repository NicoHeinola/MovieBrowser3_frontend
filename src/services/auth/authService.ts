import type { User } from '@/interfaces/api/models/User';
import type { AuthLoginRequest } from '@/interfaces/api/requests/AuthLoginRequest';
import type { AuthRegisterRequest } from '@/interfaces/api/requests/AuthRegisterRequest';
import type { UpdateUserRequest } from '@/interfaces/api/requests/UpdateUserRequest';
import type { AuthTokenResponse } from '@/interfaces/api/responses/AuthTokenResponse';

import { apiClient } from '@/plugins/api/apiClient';

const login = async (request: AuthLoginRequest): Promise<AuthTokenResponse> => {
  const response = await apiClient.post<AuthTokenResponse>('auth/login', request);

  return response.data;
};

const register = async (request: AuthRegisterRequest): Promise<AuthTokenResponse> => {
  const response = await apiClient.post<AuthTokenResponse>('auth/register', request);

  return response.data;
};

const updateUser = async (userId: number, request: UpdateUserRequest): Promise<User> => {
  const response = await apiClient.patch<User>(`users/${userId}`, request);

  return response.data;
};

export const authService = {
  login,
  register,
  updateUser,
};
