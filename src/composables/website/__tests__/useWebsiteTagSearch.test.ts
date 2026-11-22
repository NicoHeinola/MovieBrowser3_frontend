import type { WebsiteTag } from '@/interfaces/api/models/WebsiteTag';
import type { EffectScope } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, effectScope } from 'vue';

import { websiteTagService } from '@/services/website/websiteTagService';
import { useWebsiteTagSearch } from '../useWebsiteTagSearch';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar: vi.fn() }),
}));

vi.mock('@/services/website/websiteTagService', () => ({
  websiteTagService: {
    list: vi.fn(),
  },
}));

const tag: WebsiteTag = { id: 8, name: 'docs', websites_count: 3 };

const scopes: EffectScope[] = [];

/**
 * Runs the tag search inside an app that provides the query client, and waits for the first load. No router: the
 * tag search stays out of the URL.
 * @returns The tag search state.
 */
const setupSearch = async () => {
  const app = createApp({});
  app.use(VueQueryPlugin, { queryClient });

  const scope = effectScope();
  scopes.push(scope);

  const search = app.runWithContext(() => scope.run(() => useWebsiteTagSearch()))!;
  await flushPromises();

  return search;
};

describe('useWebsiteTagSearch', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
    vi.mocked(websiteTagService.list).mockResolvedValue({
      data: [tag],
      meta: { current_page: 1, last_page: 1, per_page: 1, total: 1 },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
  });

  it('lists 50 tags per page by name', async () => {
    const { tags, totalPages } = await setupSearch();

    expect(websiteTagService.list).toHaveBeenCalledWith({
      filter: undefined,
      sort: 'name',
      page: { number: 1, size: 50 },
    });
    expect(tags.value).toEqual([tag]);
    expect(totalPages.value).toBe(1);
  });

  it('searches by the trimmed term, sorted as the table asks, from the first page', async () => {
    vi.useFakeTimers();
    const { searchInput, sort, page } = await setupSearch();

    page.value = 2;
    sort.value = '-name';
    searchInput.value = ' doc ';
    await flushPromises();
    vi.advanceTimersByTime(300);
    await flushPromises();

    expect(vi.mocked(websiteTagService.list).mock.lastCall?.[0]).toEqual({
      filter: { search: 'doc' },
      sort: '-name',
      page: { number: 1, size: 50 },
    });
  });
});
