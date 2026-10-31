import type { Website } from '@/interfaces/api/models/Website';
import type { EffectScope } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, effectScope } from 'vue';

import { websiteService } from '@/services/website/websiteService';
import { useWebsiteSearch } from '../useWebsiteSearch';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar: vi.fn() }),
}));

vi.mock('@/services/website/websiteService', () => ({
  websiteService: {
    list: vi.fn(),
  },
}));

const website: Website = {
  id: 1,
  url: 'https://vuetifyjs.com',
  title: 'Vuetify',
  icon: null,
  description: null,
  tags: [],
  created_at: '2026-10-31T12:00:00.000000Z',
  updated_at: '2026-10-31T12:00:00.000000Z',
};

const scopes: EffectScope[] = [];

/**
 * Runs the website search inside an app that provides the query client, and waits for the first load.
 * @returns The website search state.
 */
const setupSearch = async () => {
  const app = createApp({});
  app.use(VueQueryPlugin, { queryClient });

  const scope = effectScope();
  scopes.push(scope);

  const search = app.runWithContext(() => scope.run(() => useWebsiteSearch()))!;
  await flushPromises();

  return search;
};

describe('useWebsiteSearch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
    vi.mocked(websiteService.list).mockResolvedValue({
      data: [website],
      meta: { current_page: 1, last_page: 1, per_page: 24, total: 1 },
    });
  });

  afterEach(() => {
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
  });

  it('lists 24 websites per page sorted by name', async () => {
    const { websites } = await setupSearch();

    const expected = { filter: undefined, sort: 'title', page: { number: 1, size: 24 } };
    expect(websiteService.list).toHaveBeenCalledWith(expected);
    expect(websites.value).toEqual([website]);
  });

  it('sends tag filters as backend params and counts them', async () => {
    const { filters, activeFilterCount } = await setupSearch();

    filters.value = { tagIds: [1], excludedTagIds: [2] };
    await flushPromises();

    expect(vi.mocked(websiteService.list).mock.lastCall?.[0].filter).toEqual({ 'tags.id': ['1'], exclude_tags: ['2'] });
    expect(activeFilterCount.value).toBe(2);
  });

  it('toggles a clicked tag in and out of the included tags, leaving excluded ones alone', async () => {
    const { filters, toggleTag } = await setupSearch();

    toggleTag(1);
    expect(filters.value).toEqual({ tagIds: [1], excludedTagIds: [] });

    toggleTag(1);
    expect(filters.value).toEqual({ tagIds: [], excludedTagIds: [] });

    filters.value = { tagIds: [3], excludedTagIds: [2] };
    toggleTag(4);
    expect(filters.value).toEqual({ tagIds: [3, 4], excludedTagIds: [2] });
  });
});
