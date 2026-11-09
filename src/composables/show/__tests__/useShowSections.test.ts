import type { ShowSection } from '@/interfaces/api/models/ShowSection';
import type { EffectScope } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp, effectScope } from 'vue';

import { ShowQueryKey } from '@/enums/query/showQueryKey';
import { showSectionService } from '@/services/show/showSectionService';
import { useShowSections } from '../useShowSections';

const showAPIErrorSnackbar = vi.fn();

vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar, showSuccessSnackbar: vi.fn() }),
}));

vi.mock('@/services/show/showSectionService', () => ({ showSectionService: { list: vi.fn(), update: vi.fn() } }));

const meta = { current_page: 1, last_page: 1, per_page: 0, total: 2 };
const scopes: EffectScope[] = [];
let queryClient: QueryClient;

/**
 * Builds a section at the given position.
 * @param id - Section id.
 * @param sortOrder - Saved position.
 * @returns The section.
 */
const createSection = (id: number, sortOrder: number): ShowSection => ({ id, sort_order: sortOrder }) as ShowSection;

/**
 * Runs the composable inside an app with a query client and waits for the sections to load.
 * @returns The composable's state.
 */
const setup = async () => {
  const app = createApp({});
  app.use(VueQueryPlugin, { queryClient });
  const scope = effectScope();
  scopes.push(scope);

  const sections = app.runWithContext(() => scope.run(() => useShowSections()))!;
  await flushPromises();

  return sections;
};

describe('useShowSections', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(showSectionService.list).mockResolvedValue({ data: [createSection(1, 0), createSection(2, 1)], meta });
  });

  afterEach(() => {
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
  });

  it("puts the server's order back when saving a new one fails", async () => {
    vi.mocked(showSectionService.update).mockRejectedValue(new Error('fail'));
    const { sections, saveOrder, isSavingOrder } = await setup();

    sections.value = [createSection(2, 1), createSection(1, 0)];
    await saveOrder(sections.value);

    expect(showAPIErrorSnackbar).toHaveBeenCalled();
    expect(sections.value.map((section) => section.id)).toEqual([1, 2]);
    expect(isSavingOrder.value).toBe(false);
  });

  it('drops the home page cache on refresh, as home is built from the sections', async () => {
    const { refresh } = await setup();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

    await refresh();

    expect(showSectionService.list).toHaveBeenCalledTimes(2);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: [ShowQueryKey.HomeShows] });
  });
});
