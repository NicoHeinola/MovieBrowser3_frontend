import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import { computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const token = useStorage<string | null>('auth.token', null);
  const isAuthenticated = computed(() => Boolean(token.value));

  const login = (email: string): void => {
    token.value = `${email}:session`;
  };

  const register = (email: string): void => {
    token.value = `${email}:session`;
  };

  const logout = (): void => {
    token.value = null;
  };

  return {
    isAuthenticated,
    login,
    logout,
    register,
    token,
  };
});
