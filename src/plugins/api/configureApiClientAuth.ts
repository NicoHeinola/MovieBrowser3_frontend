import type { ApiClientAuthOptions } from './apiClientAuthOptions';

import axios from 'axios';

import { apiClient } from './apiClient';

/**
 * Adds the bearer token to every API request and calls `onUnauthorized` when a logged-in request gets a 401.
 * Call it once at app startup.
 * @param options - How to read the token and what to do when the session has expired.
 * @returns Nothing.
 */
export const configureApiClientAuth = (options: ApiClientAuthOptions): void => {
  apiClient.interceptors.request.use((config) => {
    const token = options.getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      // Only a request sent with a token means the session expired; a failed login is a plain 401.
      if (axios.isAxiosError(error) && error.response?.status === 401 && options.getToken()) {
        await options.onUnauthorized();
      }

      throw error;
    },
  );
};
