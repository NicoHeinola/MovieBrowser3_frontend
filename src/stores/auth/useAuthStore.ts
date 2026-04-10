import type { AuthLoginRequest } from '@/interfaces/api/requests/AuthLoginRequest';
import type { AuthRegisterRequest } from '@/interfaces/api/requests/AuthRegisterRequest';

import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed } from 'vue';

import { authService } from './authService';

export const useAuthStore = defineStore('auth', () => {
  const token = useStorage<string | null>('auth.token', null);
  const user = useStorage<User | null>('auth.user', null);
  const isAuthenticated = computed(() => Boolean(token.value));

  const setToken = (value: string | null): void => {
    token.value = value;
  };

  const login = async (request: AuthLoginRequest): Promise<void> => {
    const response = await authService.login(request);

    setToken(response.token);
  };

  const logout = (): void => {
    token.value = null;
  };

  const register = async (request: AuthRegisterRequest): Promise<void> => {
    const response = await authService.register(request);

    setToken(response.token);
  };

  return {
    isAuthenticated,
    login,
    logout,
    register,
    token,
  };
});
