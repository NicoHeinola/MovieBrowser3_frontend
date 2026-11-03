import type { AppVersion } from '@/interfaces/api/models/AppVersion';
import type { EffectScope, Ref } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { effectScope, ref } from 'vue';

import { useUpdateNotice } from '../useUpdateNotice';

const data: Ref<AppVersion | undefined> = ref<AppVersion | undefined>(undefined);
const useQuery = vi.fn(() => ({ data }));

vi.mock('@tanstack/vue-query', () => ({
  useQuery: (options: unknown) => useQuery(options),
}));

const authStore = { isAuthenticated: true, isAdmin: true };

vi.mock('@/stores/auth/useAuthStore', () => ({
  useAuthStore: () => authStore,
}));

const scopes: EffectScope[] = [];

/**
 * Builds an app-version payload with a backend update. The frontend release stays unknown, since the running
 * frontend version comes from `package.json`.
 * @param latest - The newest backend release.
 * @returns The payload.
 */
const createAppVersion = (latest: string | null): AppVersion => ({
  backend: { current: '1.1.0', latest, release_url: latest ? `https://example.com/v${latest}` : null },
  frontend: { latest: null, release_url: null },
  checked_at: null,
});

/**
 * Runs the composable inside an effect scope, like a component setup would.
 * @returns The composable's public surface.
 */
const setup = () => {
  const scope = effectScope();
  scopes.push(scope);

  return scope.run(() => useUpdateNotice())!;
};

describe('useUpdateNotice', () => {
  afterEach(() => {
    for (const scope of scopes.splice(0)) scope.stop();
    data.value = undefined;
    useQuery.mockClear();
    authStore.isAuthenticated = true;
    authStore.isAdmin = true;
  });

  it('checks once per page load without retrying', () => {
    setup();

    expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({ staleTime: Infinity, retry: false }));
    expect(useQuery).not.toHaveBeenCalledWith(expect.objectContaining({ refetchInterval: expect.anything() }));
  });

  it.each([
    [true, true, true],
    [true, false, false],
    [false, false, false],
  ])('logged in %s, admin %s: checks for updates %s', (isAuthenticated, isAdmin, isEnabled) => {
    authStore.isAuthenticated = isAuthenticated;
    authStore.isAdmin = isAdmin;
    setup();

    const [options] = useQuery.mock.calls[0] as unknown as [{ enabled: { value: boolean } }];

    expect(options.enabled.value).toBe(isEnabled);
  });

  it('shows nothing before the check answers or when GitHub was unreachable', () => {
    const { update } = setup();

    expect(update.value).toBeNull();

    data.value = createAppVersion(null);

    expect(update.value).toBeNull();
  });

  it('shows a newer version', () => {
    data.value = createAppVersion('1.2.0');

    expect(setup().update.value?.version).toBe('1.2.0');
  });

  it('follows a newer release from the next check', () => {
    data.value = createAppVersion('1.2.0');
    const { update } = setup();

    data.value = createAppVersion('1.3.0');

    expect(update.value?.version).toBe('1.3.0');
  });
});
