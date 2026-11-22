import type { EffectScope } from 'vue';
import type { Router } from 'vue-router';

import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, effectScope } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import { nyaaMirrors } from '@/data/nyaa/nyaaMirrors';
import { useNyaaSearch } from '../useNyaaSearch';

const scopes: EffectScope[] = [];

/**
 * Runs the nyaa search on a memory router opened at the given URL.
 * @param url - The URL the router starts at.
 * @returns The search and the router.
 */
const setupSearch = async (url = '/admin/torrents') => {
  const router: Router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/admin/torrents', component: { template: '<div />' } }],
  });
  await router.push(url);

  const app = createApp({});
  app.use(router);

  const scope = effectScope();
  scopes.push(scope);

  const search = app.runWithContext(() => scope.run(() => useNyaaSearch()))!;

  return { search, router };
};

describe('useNyaaSearch', () => {
  const open = vi.fn();

  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('open', open);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.resetAllMocks();
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
  });

  it('starts on English-translated anime, biggest first, on the first mirror', async () => {
    const { search } = await setupSearch();

    expect(search.settings.value).toEqual({
      mirror: nyaaMirrors[0].host,
      sort: '-size',
      filters: { category: '1_2', trust: '0' },
    });
    expect(search.mirror.value).toEqual(nyaaMirrors[0]);
    // The default category is a filter: clearing goes to every category
    expect(search.activeFilterCount.value).toBe(1);
  });

  it("starts from the URL's search term and writes a new one back, dropping the page", async () => {
    vi.useFakeTimers();
    const { search, router } = await setupSearch('/admin/torrents?q=frieren&sort=-seeders&page=3');

    expect(search.search.value).toBe('frieren');

    search.search.value = ' dandadan ';
    await flushPromises();
    vi.advanceTimersByTime(300);
    await flushPromises();

    expect(router.currentRoute.value.query).toEqual({ q: 'dandadan', sort: '-seeders' });
  });

  it('opens the trimmed search with its filters and sort on the picked mirror', async () => {
    const { search } = await setupSearch('/admin/torrents?q=%20frieren%20');
    search.settings.value.mirror = nyaaMirrors[1].host;
    search.settings.value.sort = 'id';
    search.settings.value.filters = { category: '4_0', trust: '2' };

    search.openSearch();

    expect(open).toHaveBeenCalledWith(`${nyaaMirrors[1].url}/?f=2&c=4_0&q=frieren&s=id&o=asc`, '_blank', 'noopener');
  });

  it('clears the filters to every category, keeping the sort and mirror', async () => {
    const { search } = await setupSearch();
    search.settings.value.sort = '-seeders';

    search.clearFilters();
    search.openSearch();

    expect(search.activeFilterCount.value).toBe(0);
    expect(open).toHaveBeenCalledWith(`${nyaaMirrors[0].url}/?f=0&c=0_0&q=&s=seeders&o=desc`, '_blank', 'noopener');
  });

  it('remembers its settings between visits', async () => {
    const first = await setupSearch();
    first.search.settings.value.mirror = nyaaMirrors[1].host;
    first.search.settings.value.filters = { category: '4_0', trust: '1' };
    await flushPromises();

    const second = await setupSearch();

    expect(second.search.settings.value).toEqual({
      mirror: nyaaMirrors[1].host,
      sort: '-size',
      filters: { category: '4_0', trust: '1' },
    });
  });

  it('checks stored settings, so a removed mirror or a missing filter gets its default', async () => {
    localStorage.setItem('nyaaSearch', JSON.stringify({ mirror: 'nyaa.gone', sort: '-size', filters: { trust: '2' } }));

    const { search } = await setupSearch();

    expect(search.settings.value).toEqual({
      mirror: nyaaMirrors[0].host,
      sort: '-size',
      filters: { category: '1_2', trust: '2' },
    });
    expect(search.mirror.value).toEqual(nyaaMirrors[0]);
  });

  it("opens a mirror's home page", async () => {
    const { search } = await setupSearch();

    search.openMirror(nyaaMirrors[1]);

    expect(open).toHaveBeenCalledWith(nyaaMirrors[1].url, '_blank', 'noopener');
  });
});
