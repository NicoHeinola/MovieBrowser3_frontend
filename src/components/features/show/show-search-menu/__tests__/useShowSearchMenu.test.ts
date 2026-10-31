import type { Show } from '@/interfaces/api/models/Show';
import type { EffectScope } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, effectScope } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import { showService } from '@/services/show/showService';
import { useShowSearchMenu } from '../useShowSearchMenu';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar: vi.fn() }),
}));

vi.mock('@/services/show/showService', () => ({
  showService: {
    list: vi.fn(),
  },
}));

const show = { id: 1, titles: [{ title: 'Naruto', is_primary: true }], entries: [] } as unknown as Show;

const scopes: EffectScope[] = [];

/**
 * Runs the navigation search on a memory router opened at the given URL.
 * @param url - The URL the router starts at.
 * @returns The search state and the router.
 */
const setupSearch = async (url = '/') => {
  const component = { template: '<div />' };
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'authenticated-home', component },
      { path: '/search', name: 'authenticated-search', component },
    ],
  });
  await router.push(url);

  const app = createApp({});
  app.use(VueQueryPlugin, { queryClient });
  app.use(router);

  const scope = effectScope();
  scopes.push(scope);

  const search = app.runWithContext(() => scope.run(() => useShowSearchMenu()))!;
  await flushPromises();

  return { ...search, router };
};

describe('useShowSearchMenu', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
    vi.mocked(showService.list).mockResolvedValue({
      data: [show],
      meta: { current_page: 1, last_page: 3, per_page: 8, total: 20 },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
  });

  it('does not search without a term', async () => {
    const { shows, isLoading } = await setupSearch();

    expect(showService.list).not.toHaveBeenCalled();
    expect(shows.value).toEqual([]);
    expect(isLoading.value).toBe(false);
  });

  it('suggests the first 8 newest matches for the debounced, trimmed term', async () => {
    vi.useFakeTimers();
    const { search, shows, totalResults, isLoading } = await setupSearch();

    search.value = '  naruto ';
    await flushPromises();
    expect(isLoading.value).toBe(true);
    expect(showService.list).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    await flushPromises();

    expect(showService.list).toHaveBeenCalledWith({
      filter: { search: 'naruto' },
      sort: '-created_at',
      page: { number: 1, size: 8 },
    });
    expect(shows.value).toEqual([show]);
    expect(totalResults.value).toBe(20);
    expect(isLoading.value).toBe(false);
  });

  it('does not count a cleared field as loading', async () => {
    vi.useFakeTimers();
    const { search, shows, isLoading } = await setupSearch();

    search.value = 'naruto';
    await flushPromises();
    vi.advanceTimersByTime(300);
    await flushPromises();
    expect(shows.value).toEqual([show]);

    search.value = '';
    await flushPromises();

    expect(isLoading.value).toBe(false);
    expect(shows.value).toEqual([show]);
  });

  it('opens the search page with the term and clears the field', async () => {
    const { search, openSearchPage, router } = await setupSearch();

    search.value = ' naruto ';
    await openSearchPage();

    expect(router.currentRoute.value.fullPath).toBe('/search?q=naruto');
    expect(search.value).toBe('');
  });

  it('opens the plain search page without a term', async () => {
    const { openSearchPage, router } = await setupSearch();

    await openSearchPage();

    expect(router.currentRoute.value.fullPath).toBe('/search');
  });

  it('keeps the filters and sort of the search page but starts from its first page', async () => {
    const { search, openSearchPage, router } = await setupSearch('/search?q=bleach&category=anime&sort=title&page=3');

    search.value = 'naruto';
    await openSearchPage();

    expect(router.currentRoute.value.fullPath).toBe('/search?q=naruto&category=anime&sort=title');
  });

  it('leaves the search page alone when the field is empty', async () => {
    const { openSearchPage, router } = await setupSearch('/search?q=bleach&page=2');

    await openSearchPage();

    expect(router.currentRoute.value.fullPath).toBe('/search?q=bleach&page=2');
  });
});
