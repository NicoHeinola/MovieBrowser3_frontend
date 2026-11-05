import type { SetupStatus } from '@/interfaces/api/models/SetupStatus';

import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setupService } from '@/services/setup/setupService';
import { useAuthStore } from '@/stores/auth/useAuthStore';
import { useSetupStore } from '@/stores/setup/useSetupStore';

import router from '../index';

vi.mock('@/services/setup/setupService', () => ({
  setupService: {
    get: vi.fn(),
    check: vi.fn(),
    complete: vi.fn(),
  },
}));

// The guard is under test, not the pages, so every route opens an empty component.
vi.mock('@/pages/admin/users/UsersView.vue', () => ({ default: { render: () => null } }));
vi.mock('@/pages/admin/setup/SetupView.vue', () => ({ default: { render: () => null } }));
vi.mock('@/pages/authenticated/home/HomeView.vue', () => ({ default: { render: () => null } }));
vi.mock('@/pages/authenticated/search/SearchView.vue', () => ({ default: { render: () => null } }));

const createStatus = (completedAt: string | null): SetupStatus => ({
  completed_at: completedAt,
  media_folders: [],
  detected_vlc_media_player_path: null,
});

/**
 * Logs a user in by setting the persisted auth state the guard reads.
 * @param isAdmin - Whether the user is an admin.
 * @returns Nothing.
 */
const logIn = (isAdmin: boolean): void => {
  const authStore = useAuthStore();

  authStore.token = 'token';
  authStore.user = { id: 1, username: 'admin', is_admin: isAdmin };
};

describe('router setup redirect', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    setActivePinia(createPinia());
    vi.resetAllMocks();
    // Start every test from the same route, so a push to it always runs the guard.
    logIn(false);
    await router.push('/');
  });

  it('sends an admin to the setup wizard while setup is due', async () => {
    vi.mocked(setupService.get).mockResolvedValue(createStatus(null));
    logIn(true);

    await router.push('/admin/users');

    expect(router.currentRoute.value.name).toBe('admin-setup');
  });

  it('lets an admin through once setup is completed', async () => {
    vi.mocked(setupService.get).mockResolvedValue(createStatus('2026-11-01T12:00:00.000000Z'));
    logIn(true);

    await router.push('/admin/users');

    expect(router.currentRoute.value.name).toBe('admin-users');
  });

  it('never sends a non-admin to the setup wizard', async () => {
    await router.push('/search').catch(() => undefined);

    expect(setupService.get).not.toHaveBeenCalled();
  });

  it('lets an admin through and stops asking when the status request fails', async () => {
    vi.mocked(setupService.get).mockRejectedValue(new Error('Request failed with status code 404'));
    logIn(true);

    await router.push('/admin/users');
    await router.push('/');

    expect(router.currentRoute.value.name).toBe('authenticated-home');
    expect(setupService.get).toHaveBeenCalledTimes(1);
    expect(useSetupStore().isSkipped).toBe(true);
  });

  it('still sends the next admin to the setup wizard after an expired login', async () => {
    // The API client logs out on a 401 before the request fails, as configureApiClientAuth does.
    vi.mocked(setupService.get).mockImplementationOnce(async () => {
      useAuthStore().logout();
      throw new Error('Request failed with status code 401');
    });
    logIn(true);

    await router.push('/admin/users').catch(() => undefined);

    expect(useSetupStore().isSkipped).toBe(false);

    vi.mocked(setupService.get).mockResolvedValue(createStatus(null));
    logIn(true);
    // A different route than the failed push, since repeating the current route skips the guards.
    await router.push('/');

    expect(router.currentRoute.value.name).toBe('admin-setup');
  });
});
