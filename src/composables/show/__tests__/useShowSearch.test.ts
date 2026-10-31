import type { EffectScope } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, effectScope } from 'vue';

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
 * Runs the show search inside an app that provides the query client, and waits for the first load.
 * @returns The show search state.
 */
const setupSearch = async () => {
  const app = createApp({});
  app.use(VueQueryPlugin, { queryClient });

  const scope = effectScope();
  scopes.push(scope);

  const search = app.runWithContext(() => scope.run(() => useShowSearch(ShowQueryKey.SearchShows)))!;
  await flushPromises();

  return search;
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
      categories: ['anime'],
      excludedCategories: ['horror'],
      watchStatuses: [WatchStatus.Watching],
      excludedWatchStatuses: [WatchStatus.Dropped],
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
});
