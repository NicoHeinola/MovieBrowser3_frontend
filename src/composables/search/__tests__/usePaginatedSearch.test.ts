import type { PaginatedSearchOptions } from '../PaginatedSearchOptions';
import type { EffectScope } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, effectScope } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import { getQueryStrings } from '@/utils/route/getQueryStrings';
import { usePaginatedSearch } from '../usePaginatedSearch';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar: vi.fn() }),
}));

interface Item {
  id: number;
}

interface Filters {
  colors: string[];
}

const list = vi.fn<PaginatedSearchOptions<Item, Filters>['list']>();

const options: PaginatedSearchOptions<Item, Filters> = {
  queryKey: 'testItems',
  list,
  createEmptyFilters: () => ({ colors: [] }),
  getFilterParams: (searchTerm, filters) => {
    const params: Record<string, string | string[]> = {};
    if (searchTerm) params.search = searchTerm;
    if (filters.colors.length > 0) params.color = filters.colors;
    return Object.keys(params).length > 0 ? params : undefined;
  },
  countActiveFilters: (filters) => filters.colors.length,
  defaultSort: '-created_at',
  pageSize: 10,
};

const scopes: EffectScope[] = [];

/**
 * Runs the search inside an app that provides the query client, and waits for the first load.
 * @returns The search state.
 */
const setupSearch = async () => {
  const app = createApp({});
  app.use(VueQueryPlugin, { queryClient });

  const scope = effectScope();
  scopes.push(scope);

  const search = app.runWithContext(() => scope.run(() => usePaginatedSearch(options)))!;
  await flushPromises();

  return search;
};

const routeOptions: PaginatedSearchOptions<Item, Filters> = {
  ...options,
  routeQuery: {
    sortValues: ['-created_at', 'title'],
    getFiltersQuery: (filters) => (filters.colors.length > 0 ? { color: filters.colors } : {}),
    getFiltersFromQuery: (query) => ({ colors: getQueryStrings(query.color) }),
  },
};

/**
 * Runs the URL-synced search on a memory router opened at the given URL, and waits for the first load.
 * @param url - The URL the router starts at.
 * @returns The search state and the router.
 */
const setupRouteSearch = async (url: string) => {
  const component = { template: '<div />' };
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/search', name: 'search', component },
      { path: '/other', name: 'other', component },
    ],
  });
  await router.push(url);

  const app = createApp({});
  app.use(VueQueryPlugin, { queryClient });
  app.use(router);

  const scope = effectScope();
  scopes.push(scope);

  const search = app.runWithContext(() => scope.run(() => usePaginatedSearch(routeOptions)))!;
  await flushPromises();

  return { search, router };
};

const getLastQuery = () => list.mock.lastCall?.[0];

describe('usePaginatedSearch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
    list.mockResolvedValue({ data: [{ id: 1 }], meta: { current_page: 1, last_page: 3, per_page: 10, total: 25 } });
  });

  afterEach(() => {
    vi.useRealTimers();
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
  });

  it('loads the first page with the default sort and exposes the backend totals', async () => {
    const { items, totalPages, totalResults, isLoading, activeFilterCount } = await setupSearch();

    expect(getLastQuery()).toEqual({ filter: undefined, sort: '-created_at', page: { number: 1, size: 10 } });
    expect(items.value).toEqual([{ id: 1 }]);
    expect(totalPages.value).toBe(3);
    expect(totalResults.value).toBe(25);
    expect(isLoading.value).toBe(false);
    expect(activeFilterCount.value).toBe(0);
  });

  it('debounces the search term, trims it and goes back to the first page', async () => {
    vi.useFakeTimers();
    const { searchInput, page, isLoading } = await setupSearch();

    page.value = 2;
    await flushPromises();

    searchInput.value = '  blue car ';
    await flushPromises();
    expect(isLoading.value).toBe(true);
    expect(getLastQuery()?.filter).toBeUndefined();

    vi.advanceTimersByTime(300);
    await flushPromises();

    const expected = { filter: { search: 'blue car' }, sort: '-created_at', page: { number: 1, size: 10 } };
    expect(getLastQuery()).toEqual(expected);
    expect(page.value).toBe(1);
  });

  it('treats a cleared search field as no search', async () => {
    vi.useFakeTimers();
    const { searchInput, isLoading } = await setupSearch();

    searchInput.value = null as unknown as string;
    await flushPromises();
    expect(isLoading.value).toBe(false);

    vi.advanceTimersByTime(300);
    await flushPromises();
    expect(getLastQuery()?.filter).toBeUndefined();
  });

  it('sends filters and sort, going back to the first page', async () => {
    const { filters, sort, page, activeFilterCount } = await setupSearch();

    page.value = 3;
    await flushPromises();

    filters.value = { colors: ['red', 'blue'] };
    sort.value = 'title';
    await flushPromises();

    const expected = { filter: { color: ['red', 'blue'] }, sort: 'title', page: { number: 1, size: 10 } };
    expect(getLastQuery()).toEqual(expected);
    expect(page.value).toBe(1);
    expect(activeFilterCount.value).toBe(2);
  });

  it('requests a changed page', async () => {
    const { page } = await setupSearch();

    page.value = 2;
    await flushPromises();

    expect(getLastQuery()?.page).toEqual({ number: 2, size: 10 });
  });

  it('steps back to the last page when the current one ends up past it', async () => {
    const { page, query } = await setupSearch();

    page.value = 3;
    await flushPromises();

    list.mockResolvedValue({ data: [{ id: 1 }], meta: { current_page: 3, last_page: 2, per_page: 10, total: 20 } });
    await query.refetch();
    await flushPromises();

    expect(page.value).toBe(2);
    expect(getLastQuery()?.page).toEqual({ number: 2, size: 10 });
  });

  it('clears the filters but keeps the search term', async () => {
    const { searchInput, filters, clearFilters, activeFilterCount } = await setupSearch();

    searchInput.value = 'car';
    filters.value = { colors: ['red'] };
    clearFilters();

    expect(filters.value).toEqual({ colors: [] });
    expect(activeFilterCount.value).toBe(0);
    expect(searchInput.value).toBe('car');
  });

  describe('with routeQuery', () => {
    it('starts from the URL without fetching the defaults first', async () => {
      const { search } = await setupRouteSearch('/search?q=car&color=red&sort=title&page=2');

      expect(list).toHaveBeenCalledTimes(1);
      expect(getLastQuery()).toEqual({
        filter: { search: 'car', color: ['red'] },
        sort: 'title',
        page: { number: 2, size: 10 },
      });
      expect(search.searchInput.value).toBe('car');
      expect(search.isLoading.value).toBe(false);
    });

    it('keeps the URL page once the restored search term settles', async () => {
      vi.useFakeTimers();
      const { search } = await setupRouteSearch('/search?q=car&page=2');

      vi.advanceTimersByTime(300);
      await flushPromises();

      expect(search.page.value).toBe(2);
    });

    it('writes changes to the URL, leaving out defaults', async () => {
      const { search, router } = await setupRouteSearch('/search');

      search.filters.value = { colors: ['red', 'blue'] };
      search.sort.value = 'title';
      await flushPromises();
      expect(router.currentRoute.value.fullPath).toBe('/search?color=red&color=blue&sort=title');

      search.page.value = 2;
      await flushPromises();
      expect(router.currentRoute.value.query.page).toBe('2');

      search.clearFilters();
      search.sort.value = '-created_at';
      await flushPromises();
      expect(router.currentRoute.value.fullPath).toBe('/search');
    });

    it('replaces the history entry instead of adding one', async () => {
      const { search, router } = await setupRouteSearch('/search');
      const push = vi.spyOn(router, 'push');

      search.sort.value = 'title';
      await flushPromises();

      expect(push).not.toHaveBeenCalled();
      expect(router.currentRoute.value.query.sort).toBe('title');
    });

    it('follows a URL change on the same page, keeping its page', async () => {
      const { search, router } = await setupRouteSearch('/search?q=car');

      await router.push('/search?q=bike&color=red&page=3');
      await flushPromises();

      expect(search.searchInput.value).toBe('bike');
      expect(search.filters.value).toEqual({ colors: ['red'] });
      expect(search.page.value).toBe(3);
      expect(getLastQuery()).toEqual({
        filter: { search: 'bike', color: ['red'] },
        sort: '-created_at',
        page: { number: 3, size: 10 },
      });
    });

    it('ignores the query of the page being navigated to', async () => {
      const { search, router } = await setupRouteSearch('/search?q=car');

      await router.push('/other?q=bike');
      await flushPromises();

      expect(search.searchInput.value).toBe('car');
      expect(router.currentRoute.value.fullPath).toBe('/other?q=bike');
    });

    it('falls back to the defaults for an unknown sort and an invalid page', async () => {
      await setupRouteSearch('/search?sort=password&page=abc');

      expect(getLastQuery()).toEqual({ filter: undefined, sort: '-created_at', page: { number: 1, size: 10 } });
    });
  });
});
