import type { User } from '@/interfaces/api/models/User';
import type { EffectScope } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, effectScope } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import { userService } from '@/services/user/userService';
import { useUserSearch } from '../useUserSearch';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar: vi.fn() }),
}));

vi.mock('@/services/user/userService', () => ({
  userService: {
    list: vi.fn(),
  },
}));

const user: User = {
  id: 1,
  username: 'admin',
  is_admin: true,
};

const scopes: EffectScope[] = [];

/**
 * Runs the user search inside an app that provides the query client and a router, and waits for the first load.
 * @param url - The URL the router starts at.
 * @returns The user search state.
 */
const setupSearch = async (url = '/admin/users') => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/admin/users', component: { template: '<div />' } }],
  });
  await router.push(url);

  const app = createApp({});
  app.use(VueQueryPlugin, { queryClient });
  app.use(router);

  const scope = effectScope();
  scopes.push(scope);

  const search = app.runWithContext(() => scope.run(() => useUserSearch()))!;
  await flushPromises();

  return { ...search, router };
};

describe('useUserSearch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
    vi.mocked(userService.list).mockResolvedValue({
      data: [user],
      meta: { current_page: 1, last_page: 1, per_page: 25, total: 1 },
    });
  });

  afterEach(() => {
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
  });

  it('lists 25 users per page sorted by username', async () => {
    const { users } = await setupSearch();

    const expected = { filter: undefined, sort: 'username', page: { number: 1, size: 25 } };
    expect(userService.list).toHaveBeenCalledWith(expected);
    expect(users.value).toEqual([user]);
  });

  it('sends the admin filter as a backend param and counts it', async () => {
    const { filters, activeFilterCount } = await setupSearch();

    filters.value = { role: { included: [], excluded: ['admin'] } };
    await flushPromises();

    expect(vi.mocked(userService.list).mock.lastCall?.[0].filter).toEqual({ is_admin: '0' });
    expect(activeFilterCount.value).toBe(1);

    filters.value = { role: { included: ['admin'], excluded: [] } };
    await flushPromises();

    expect(vi.mocked(userService.list).mock.lastCall?.[0].filter).toEqual({ is_admin: '1' });
  });

  it('keeps the admin filter and sort in the URL query', async () => {
    const { filters, router } = await setupSearch('/admin/users?role=admin&sort=-created_at');

    expect(vi.mocked(userService.list).mock.lastCall?.[0]).toMatchObject({
      filter: { is_admin: '1' },
      sort: '-created_at',
    });

    filters.value = { role: { included: [], excluded: [] } };
    await flushPromises();

    expect(router.currentRoute.value.fullPath).toBe('/admin/users?sort=-created_at');
  });
});
