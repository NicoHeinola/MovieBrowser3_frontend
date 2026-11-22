import type { EffectScope } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, effectScope } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import { nekoBtTorrentService } from '@/services/nekobt/nekoBtTorrentService';
import { useNekoBtTorrentSearch } from '../useNekoBtTorrentSearch';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar: vi.fn() }),
}));

vi.mock('@/services/nekobt/nekoBtTorrentService', () => ({
  nekoBtTorrentService: {
    list: vi.fn(),
  },
}));

const scopes: EffectScope[] = [];

/**
 * Runs the nekoBT search on a memory router opened at the given URL, and waits for the first load.
 * @param url - The URL the router starts at.
 * @returns The search state and the router.
 */
const setupSearch = async (url = '/admin/torrents') => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/admin/torrents', component: { template: '<div />' } }],
  });
  await router.push(url);

  const app = createApp({});
  app.use(VueQueryPlugin, { queryClient });
  app.use(router);

  const scope = effectScope();
  scopes.push(scope);

  const search = app.runWithContext(() => scope.run(() => useNekoBtTorrentSearch()))!;
  await flushPromises();

  return { ...search, router };
};

const getLastQuery = () => vi.mocked(nekoBtTorrentService.list).mock.lastCall?.[0];

describe('useNekoBtTorrentSearch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
    // Answers like the backend: the page asked for, with more after it
    vi.mocked(nekoBtTorrentService.list).mockImplementation(async (query) => ({
      data: [],
      links: { prev: null, next: '/api/v1/nekobt-torrents?page%5Bnumber%5D=2' },
      meta: { current_page: query.page.number ?? 1, per_page: 50, from: null, to: null },
    }));
  });

  afterEach(() => {
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
  });

  it('starts biggest first on the first page', async () => {
    await setupSearch();

    expect(getLastQuery()).toEqual({ filter: undefined, sort: '-size', page: { number: 1, size: 50 } });
  });

  it('reads the search, sort and page from the URL, best match included', async () => {
    const { sort, page } = await setupSearch('/admin/torrents?q=frieren&sort=best&page=2');

    expect(sort.value).toBe('best');
    expect(page.value).toBe(2);
    expect(getLastQuery()).toEqual({ filter: { search: 'frieren' }, sort: 'best', page: { number: 2, size: 50 } });
  });

  it('falls back to biggest first for a sort nekoBT does not take, and caps a page past the deepest one', async () => {
    const { sort, page } = await setupSearch('/admin/torrents?sort=-title&page=150');

    expect(sort.value).toBe('-size');
    expect(page.value).toBe(100);
  });

  it('sends the filters as the backend takes them and keeps them in the URL', async () => {
    const { filters, router } = await setupSearch(
      '/admin/torrents?level=full_scale_fansub&exclude_source=bd_mini&audio=en&batch=true&no_mtl=true',
    );

    expect(getLastQuery()?.filter).toEqual({
      levels: ['full_scale_fansub'],
      video_sources: expect.not.arrayContaining(['bd_mini']),
      audio_language: 'en',
      batch: 'true',
      machine_translation: 'false',
    });
    expect(getLastQuery()?.filter?.video_sources).toHaveLength(15);

    filters.value = { ...filters.value, batch: 'any', hideHardsubs: true };
    await flushPromises();

    expect(getLastQuery()?.filter).toMatchObject({ hardsub: 'false' });
    expect(getLastQuery()?.filter).not.toHaveProperty('batch');
    expect(router.currentRoute.value.query).toMatchObject({ no_hardsub: 'true', audio: 'en' });
    expect(router.currentRoute.value.query).not.toHaveProperty('batch');
  });

  it('writes a header sort back to the URL, leaving the default out', async () => {
    const { sort, router } = await setupSearch();

    sort.value = 'seeders';
    await flushPromises();
    expect(router.currentRoute.value.query).toEqual({ sort: 'seeders' });

    sort.value = '-size';
    await flushPromises();
    expect(router.currentRoute.value.query).toEqual({});
  });
});
