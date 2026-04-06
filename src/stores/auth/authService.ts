import type { AuthLoginRequest } from '@/interfaces/api/AuthLoginRequest';
import type { AuthRegisterRequest } from '@/interfaces/api/AuthRegisterRequest';
import type { AuthTokenResponse } from '@/interfaces/api/AuthTokenResponse';

import { apiClient } from '@/plugins/api/apiClient';

const login = async (request: AuthLoginRequest): Promise<AuthTokenResponse> => {
  const response = await apiClient.post<AuthTokenResponse>('auth/login', request);

  return response.data;
};

const register = async (request: AuthRegisterRequest): Promise<AuthTokenResponse> => {
  const response = await apiClient.post<AuthTokenResponse>('auth/register', request);

  return response.data;
};

export const authService = {
  login,
  register,
};
