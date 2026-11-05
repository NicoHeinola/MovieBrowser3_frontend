import type { ShowSearchFilters } from '../ShowSearchFilters';
import type { EffectScope } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, effectScope } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { WatchStatus } from '@/enums/show/WatchStatus';
import { showService } from '@/services/show/showService';
import { useShowSearch } from '../useShowSearch';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar: vi.fn() }),
}));

vi.mock('@/services/show/showService', () => ({
  showService: {
    list: vi.fn(),
  },
}));

const scopes: EffectScope[] = [];

/**
 * Runs the show search inside an app that provides the query client and a router, and waits for the first load.
 * @param url - The URL the router starts at.
 * @param defaultFilters - The filters the search starts with.
 * @returns The show search state.
 */
const setupSearch = async (url = '/search', defaultFilters: Partial<ShowSearchFilters> = {}) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/search', component: { template: '<div />' } }],
  });
  await router.push(url);

  const app = createApp({});
  app.use(VueQueryPlugin, { queryClient });
  app.use(router);

  const scope = effectScope();
  scopes.push(scope);

  const search = app.runWithContext(() => scope.run(() => useShowSearch(ShowQueryKey.SearchShows, defaultFilters)))!;
  await flushPromises();

  return { ...search, router };
};

describe('useShowSearch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
    vi.mocked(showService.list).mockResolvedValue({
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 32, total: 0 },
    });
  });

  afterEach(() => {
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
  });

  it('lists 32 newest shows per page', async () => {
    const { shows } = await setupSearch();

    const expected = { filter: undefined, sort: '-created_at', page: { number: 1, size: 32 } };
    expect(showService.list).toHaveBeenCalledWith(expected);
    expect(shows.value).toEqual([]);
  });

  it('sends every filter as backend params and counts them, the preview switch included', async () => {
    const { filters, activeFilterCount } = await setupSearch();

    filters.value = {
      watchStatus: { included: [WatchStatus.Watching], excluded: [WatchStatus.Dropped] },
      category: { included: ['anime'], excluded: ['horror'] },
      hasPreview: true,
    };
    await flushPromises();

    expect(vi.mocked(showService.list).mock.lastCall?.[0].filter).toEqual({
      'categories.value': ['anime'],
      exclude_categories: ['horror'],
      watch_status: [WatchStatus.Watching],
      exclude_watch_status: [WatchStatus.Dropped],
      preview_url: 'not_null',
    });
    expect(activeFilterCount.value).toBe(5);
  });

  it('keeps the filters in the URL query', async () => {
    const { filters, router } = await setupSearch('/search?category=anime&watch_status=watching&has_preview=true');

    expect(vi.mocked(showService.list).mock.lastCall?.[0].filter).toEqual({
      'categories.value': ['anime'],
      watch_status: [WatchStatus.Watching],
      preview_url: 'not_null',
    });

    filters.value = {
      ...filters.value,
      category: { included: ['anime'], excluded: ['horror'] },
      hasPreview: false,
    };
    await flushPromises();

    expect(router.currentRoute.value.fullPath).toBe(
      '/search?watch_status=watching&category=anime&exclude_category=horror',
    );
  });

  describe('with default filters', () => {
    const defaultFilters = { watchStatus: { included: [], excluded: [WatchStatus.Completed] } };
    const lastFilter = () => vi.mocked(showService.list).mock.lastCall?.[0].filter;

    it('applies them as an active filter without touching the URL', async () => {
      const { activeFilterCount, router } = await setupSearch('/search', defaultFilters);

      expect(lastFilter()).toEqual({ exclude_watch_status: [WatchStatus.Completed] });
      expect(activeFilterCount.value).toBe(1);
      expect(router.currentRoute.value.fullPath).toBe('/search');
    });

    it('clears them and keeps them cleared after a reload', async () => {
      const { clearFilters, router } = await setupSearch('/search', defaultFilters);

      clearFilters();
      await flushPromises();

      expect(lastFilter()).toBeUndefined();
      expect(router.currentRoute.value.fullPath).toBe('/search?watch_status=');

      const reloaded = await setupSearch(router.currentRoute.value.fullPath, defaultFilters);

      expect(lastFilter()).toBeUndefined();
      expect(reloaded.activeFilterCount.value).toBe(0);
    });

    it('does not exclude a status the URL includes', async () => {
      await setupSearch('/search?watch_status=completed', defaultFilters);

      expect(lastFilter()).toEqual({ watch_status: [WatchStatus.Completed] });
    });
  });
});
