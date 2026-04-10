import type { AuthLoginRequest } from '@/interfaces/api/requests/AuthLoginRequest';
import type { AuthRegisterRequest } from '@/interfaces/api/requests/AuthRegisterRequest';
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

export const authService = {
  login,
  register,
};
