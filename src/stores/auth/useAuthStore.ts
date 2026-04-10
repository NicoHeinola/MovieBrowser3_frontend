import type { User } from '@/interfaces/api/models/User';
import type { AuthLoginRequest } from '@/interfaces/api/requests/AuthLoginRequest';
import type { AuthRegisterRequest } from '@/interfaces/api/requests/AuthRegisterRequest';
import { StorageSerializers, useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed } from 'vue';

import { authService } from '@/services/auth/authService';

export const useAuthStore = defineStore('auth', () => {
  const token = useStorage<string | null>('auth.token', null);
  const user = useStorage<User | null>('auth.user', null, undefined, {
    serializer: StorageSerializers.object,
  });

  const isAuthenticated = computed(() => Boolean(token.value));

  const isAdmin = computed(() => user.value?.is_admin ?? false);

  const login = async (request: AuthLoginRequest): Promise<void> => {
    const response = await authService.login(request);

    token.value = response.token;
    user.value = response.user;
  };

  const logout = (): void => {
    token.value = null;
    user.value = null;
  };

  const register = async (request: AuthRegisterRequest): Promise<void> => {
    const response = await authService.register(request);

    token.value = response.token;
    user.value = response.user;
  };

  return {
    isAuthenticated,
    isAdmin,
    login,
    logout,
    register,
    token,
    user,
  };
});
