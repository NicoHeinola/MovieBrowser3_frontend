import type { User } from '@/interfaces/api/models/User';

import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { authService } from '@/services/auth/authService';

import { useAuthStore } from '../useAuthStore';

vi.mock('@/services/auth/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    updateUser: vi.fn(),
  },
}));

const createUser = (overrides?: Partial<User>): User => ({
  id: 1,
  username: 'testuser',
  is_admin: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.resetAllMocks();
  });

  describe('updateUser', () => {
    it('updates persisted user after a successful username change', async () => {
      const authStore = useAuthStore();
      const original = createUser();
      authStore.user = original;

      const updated = createUser({ username: 'newname', updated_at: '2026-04-12T00:00:00Z' });
      vi.mocked(authService.updateUser).mockResolvedValue(updated);

      await authStore.updateUser({ username: 'newname' });

      expect(authStore.user).toEqual(updated);
      expect(authService.updateUser).toHaveBeenCalledWith(1, { username: 'newname' });
    });

    it('updates persisted user after a successful password change', async () => {
      const authStore = useAuthStore();
      const original = createUser();
      authStore.user = original;

      const updated = createUser({ updated_at: '2026-04-12T00:00:00Z' });
      vi.mocked(authService.updateUser).mockResolvedValue(updated);

      await authStore.updateUser({ password: 'newpass', password_confirmation: 'newpass' });

      expect(authStore.user).toEqual(updated);
      expect(authService.updateUser).toHaveBeenCalledWith(1, {
        password: 'newpass',
        password_confirmation: 'newpass',
      });
    });

    it('does not call the service when user is null', async () => {
      const authStore = useAuthStore();
      authStore.user = null;

      await authStore.updateUser({ username: 'newname' });

      expect(authService.updateUser).not.toHaveBeenCalled();
    });

    it('sets isLoading during the update and resets it on success', async () => {
      const authStore = useAuthStore();
      authStore.user = createUser();

      let resolvePromise: (value: User) => void = () => {};
      vi.mocked(authService.updateUser).mockReturnValue(
        new Promise<User>((resolve) => {
          resolvePromise = resolve;
        }),
      );

      const promise = authStore.updateUser({ username: 'newname' });
      expect(authStore.isLoading).toBe(true);

      resolvePromise(createUser({ username: 'newname' }));
      await promise;
      expect(authStore.isLoading).toBe(false);
    });

    it('resets isLoading when the service rejects', async () => {
      const authStore = useAuthStore();
      authStore.user = createUser();

      vi.mocked(authService.updateUser).mockRejectedValue(new Error('network error'));

      await expect(authStore.updateUser({ username: 'newname' })).rejects.toThrow('network error');
      expect(authStore.isLoading).toBe(false);
    });
  });
});
