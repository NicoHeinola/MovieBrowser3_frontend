import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises, shallowMount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createVuetify } from 'vuetify';

import { WatchStatus } from '@/enums/show/WatchStatus';
import { showSectionService } from '@/services/show/showSectionService';
import { showService } from '@/services/show/showService';
import HomeView from '../HomeView.vue';

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar: vi.fn() }),
}));

vi.mock('@/services/show/showService', () => ({
  showService: {
    list: vi.fn(),
  },
}));

vi.mock('@/services/show/showSectionService', () => ({
  showSectionService: {
    list: vi.fn(),
  },
}));

const meta = { current_page: 1, last_page: 1, per_page: 20, total: 0 };

/**
 * Mounts the home page with its children stubbed and waits for its requests.
 * @returns void
 */
const mountHome = async (): Promise<void> => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: { template: '<div />' } }],
  });

  shallowMount(HomeView, {
    global: {
      plugins: [
        createPinia(),
        createVuetify(),
        createI18n({ legacy: false, locale: 'en', missingWarn: false, fallbackWarn: false }),
        router,
        [VueQueryPlugin, { queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }) }],
      ],
    },
  });

  await flushPromises();
};

describe('HomeView', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(showService.list).mockResolvedValue({ data: [], meta });
    vi.mocked(showSectionService.list).mockResolvedValue({ data: [], meta });
  });

  it('leaves completed shows out of the random row', async () => {
    await mountHome();

    expect(showService.list).toHaveBeenCalledWith({
      filter: { exclude_watch_status: [WatchStatus.Completed] },
      sort: 'random',
      page: { size: 20 },
    });
  });

  it('keeps completed shows in the latest row', async () => {
    await mountHome();

    const latestCall = vi.mocked(showService.list).mock.calls.find(([query]) => query.sort === '-created_at');

    expect(latestCall?.[0].filter).toBeUndefined();
  });
});
