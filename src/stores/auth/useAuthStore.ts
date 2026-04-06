import type { AuthLoginRequest } from '@/interfaces/api/AuthLoginRequest';
import type { AuthRegisterRequest } from '@/interfaces/api/AuthRegisterRequest';

import { useStorage } from '@vueuse/core';
import { isAxiosError } from 'axios';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { authService } from './authService';

export const useAuthStore = defineStore('auth', () => {
  const token = useStorage<string | null>('auth.token', null);
  const errorMessage = ref<string | null>(null);
  const isSubmitting = ref(false);
  const isAuthenticated = computed(() => Boolean(token.value));

  const clearError = (): void => {
    errorMessage.value = null;
  };

  const getRequestErrorMessage = (error: unknown): string => {
    if (isAxiosError(error)) {
      const responseData = error.response?.data;

      if (typeof responseData === 'object' && responseData !== null && 'message' in responseData) {
        const message = responseData.message;

        if (typeof message === 'string' && message !== '') {
          return message;
        }
      }

      if (error.response?.status === 401) {
        return 'Your session is no longer valid. Please log in again.';
      }

      if ((error.response?.status ?? 0) >= 500) {
        return 'The server could not process your request. Please try again.';
      }
    }

    if (error instanceof Error && error.message !== '') {
      return error.message;
    }

    return 'Something went wrong. Please try again.';
  };

  const setToken = (value: string | null): void => {
    token.value = value;
  };

  const login = async (request: AuthLoginRequest): Promise<void> => {
    clearError();
    isSubmitting.value = true;

    try {
      const response = await authService.login(request);

      setToken(response.token);
    } catch (error) {
      setToken(null);
      errorMessage.value = getRequestErrorMessage(error);
      throw error;
    } finally {
      isSubmitting.value = false;
    }
  };

  const logout = (): void => {
    token.value = null;
    clearError();
  };

  const register = async (request: AuthRegisterRequest): Promise<void> => {
    clearError();
    isSubmitting.value = true;

    try {
      const response = await authService.register(request);

      setToken(response.token);
    } catch (error) {
      setToken(null);
      errorMessage.value = getRequestErrorMessage(error);
      throw error;
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    clearError,
    errorMessage,
    isAuthenticated,
    isSubmitting,
    login,
    logout,
    register,
    token,
  };
});
