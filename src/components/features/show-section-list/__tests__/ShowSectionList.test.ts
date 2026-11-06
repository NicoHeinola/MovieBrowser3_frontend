import type { ShowSection } from '@/interfaces/api/models/ShowSection';

import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';

import { useSortableItems } from '@/composables/sortable/useSortableItems';
import ShowSectionList from '../ShowSectionList.vue';

vi.mock('@/composables/sortable/useSortableItems', () => ({
  useSortableItems: vi.fn(() => []),
}));

const first = { id: 1 } as ShowSection;
const second = { id: 2 } as ShowSection;

/**
 * Mounts the list.
 * @param disabled Whether the list is disabled.
 * @returns The wrapper and the options the list made its sortable items with.
 */
const mountList = (disabled = false) => {
  const wrapper = shallowMount(ShowSectionList, {
    props: { disabled, sections: [first, second], 'onUpdate:sections': vi.fn() },
    global: { plugins: [createVuetify(), createI18n({ legacy: false, locale: 'en', missingWarn: false })] },
  });

  return { wrapper, options: vi.mocked(useSortableItems).mock.lastCall![1] };
};

describe('ShowSectionList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('writes a drop to the model and reports the new order', () => {
    const { wrapper, options } = mountList();

    options.setItems([second, first]);

    expect(wrapper.emitted('update:sections')).toEqual([[[second, first]]]);
    expect(wrapper.emitted('reorder')).toEqual([[[second, first]]]);
  });

  it('turns dragging off while disabled', () => {
    expect(mountList(true).options.isDisabled?.()).toBe(true);
    expect(mountList(false).options.isDisabled?.()).toBe(false);
  });
});
