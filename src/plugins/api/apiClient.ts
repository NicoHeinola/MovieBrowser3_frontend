import axios from 'axios';

import { getEnvNumber } from '@/utils/env/getEnvNumber';
import { getEnvString } from '@/utils/env/getEnvString';

export interface ApiClientAuthOptions {
  getToken: () => string | null;
  onUnauthorized: () => void | Promise<void>;
}

const apiBaseUrl = getEnvString('VITE_API_URL');
const requestTimeoutMs = getEnvNumber('VITE_API_TIMEOUT_MS');

let authOptions: ApiClientAuthOptions | null = null;

export const configureApiClientAuth = (options: ApiClientAuthOptions): void => {
  authOptions = options;
};

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: requestTimeoutMs,
});

apiClient.interceptors.request.use((config) => {
  const token = authOptions?.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && authOptions?.getToken()) {
      await authOptions.onUnauthorized();
    }

    throw error;
  },
);
