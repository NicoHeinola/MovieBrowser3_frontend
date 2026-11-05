import type { ShowSection } from '@/interfaces/api/models/ShowSection';

import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { config, flushPromises, shallowMount } from '@vue/test-utils';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';

import { ShowSectionList } from '@/components/features/show-section-list';
import { categoryService } from '@/services/show/categoryService';
import { showSectionService } from '@/services/show/showSectionService';
import CategoriesView from '../CategoriesView.vue';

const snackbar = vi.hoisted(() => ({ showAPIErrorSnackbar: vi.fn(), showSuccessSnackbar: vi.fn() }));

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => snackbar,
}));

vi.mock('@/components/layouts/dialog-provider', () => ({
  useDialog: () => ({ showDialog: vi.fn() }),
}));

vi.mock('@/services/show/categoryService', () => ({
  categoryService: {
    list: vi.fn(),
  },
}));

vi.mock('@/services/show/showSectionService', () => ({
  showSectionService: {
    list: vi.fn(),
    update: vi.fn(),
  },
}));

const meta = { current_page: 1, last_page: 1, per_page: 0, total: 2 };

/**
 * Builds a frontpage section at the given position.
 * @param id Section id.
 * @param sortOrder Saved position of the section.
 * @returns The section.
 */
const createSection = (id: number, sortOrder: number): ShowSection => {
  return { id, sort_order: sortOrder } as ShowSection;
};

/**
 * Mounts the page, waits for its requests and drops the sections in the given order.
 * @param sections Sections in their new visual order.
 * @returns void
 */
const reorderSections = async (sections: ShowSection[]): Promise<void> => {
  const wrapper = shallowMount(CategoriesView, {
    global: {
      plugins: [
        createVuetify(),
        createI18n({ legacy: false, locale: 'en', missingWarn: false, fallbackWarn: false }),
        [VueQueryPlugin, { queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }) }],
      ],
    },
  });

  await flushPromises();

  wrapper.findComponent(ShowSectionList).vm.$emit('reorder', sections);

  await flushPromises();
};

describe('CategoriesView', () => {
  beforeAll(() => {
    // The section list sits inside stubbed layout components, so their slots have to render.
    config.global.renderStubDefaultSlot = true;
  });

  afterAll(() => {
    config.global.renderStubDefaultSlot = false;
  });

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(categoryService.list).mockResolvedValue({ data: [], meta });
    vi.mocked(showSectionService.list).mockResolvedValue({ data: [createSection(1, 0), createSection(2, 1)], meta });
  });

  it('confirms a saved frontpage order', async () => {
    await reorderSections([createSection(2, 1), createSection(1, 0)]);

    expect(showSectionService.update).toHaveBeenCalledWith(2, { sort_order: 0 });
    expect(showSectionService.update).toHaveBeenCalledWith(1, { sort_order: 1 });
    expect(snackbar.showSuccessSnackbar).toHaveBeenCalledTimes(1);
    expect(snackbar.showSuccessSnackbar).toHaveBeenCalledWith('frontpage.orderSaved');
  });

  it('shows only the error when saving the order fails', async () => {
    const error = new Error('Save failed');
    vi.mocked(showSectionService.update).mockRejectedValue(error);

    await reorderSections([createSection(2, 1), createSection(1, 0)]);

    expect(snackbar.showAPIErrorSnackbar).toHaveBeenCalledWith(error);
    expect(snackbar.showSuccessSnackbar).not.toHaveBeenCalled();
  });

  it('stays quiet when the order did not change', async () => {
    await reorderSections([createSection(1, 0), createSection(2, 1)]);

    expect(showSectionService.update).not.toHaveBeenCalled();
    expect(snackbar.showSuccessSnackbar).not.toHaveBeenCalled();
  });
});
