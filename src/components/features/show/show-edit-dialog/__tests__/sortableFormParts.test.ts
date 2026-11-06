import type { EpisodeFormData } from '../EpisodeFormData';
import type { ShowEntryFormData } from '../ShowEntryFormData';

import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';

import { useSortableItems } from '@/composables/sortable/useSortableItems';
import ShowEntriesFormPart from '../ShowEntriesFormPart.vue';
import ShowEntryEpisodesFormPart from '../ShowEntryEpisodesFormPart.vue';

vi.mock('@/composables/sortable/useSortableItems', () => ({
  useSortableItems: vi.fn(() => []),
}));

vi.mock('@/composables/dialog/useConfirmDialog', () => ({
  useConfirmDialog: () => ({ confirm: vi.fn() }),
}));

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showSuccessSnackbar: vi.fn(), showWarningSnackbar: vi.fn() }),
}));

const global = { plugins: [createVuetify(), createI18n({ legacy: false, locale: 'en', missingWarn: false })] };

/**
 * Reads the options a form part made its sortable items with.
 * @returns The options of the last `useSortableItems` call.
 */
const getOptions = () => vi.mocked(useSortableItems).mock.lastCall![1];

describe('sortable show form parts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renumbers entries after a drop', () => {
    const first = { id: 1, name: 'A', sort_order: 0 } as ShowEntryFormData;
    const second = { name: 'B', sort_order: 1 } as ShowEntryFormData;
    const show = { entries: [first, second] };

    shallowMount(ShowEntriesFormPart, { props: { show }, global });

    getOptions().setItems([second, first]);

    expect(show.entries).toEqual([
      { name: 'B', sort_order: 0 },
      { id: 1, name: 'A', sort_order: 1 },
    ]);
  });

  it('renumbers episodes after a drop', () => {
    const first = { id: 1, name: 'A', sequence_number: 0 } as EpisodeFormData;
    const second = { name: 'B', sequence_number: 1 } as EpisodeFormData;
    const entry = { episodes: [first, second] } as ShowEntryFormData;

    shallowMount(ShowEntryEpisodesFormPart, { props: { entry }, global });

    getOptions().setItems([second, first]);

    expect(entry.episodes).toEqual([
      { name: 'B', sequence_number: 0 },
      { id: 1, name: 'A', sequence_number: 1 },
    ]);
  });

  it('keys saved rows by id and unsaved rows by a stable key', () => {
    shallowMount(ShowEntriesFormPart, { props: { show: { entries: [] } }, global });

    const { getKey } = getOptions();
    const unsaved = { name: 'B' } as ShowEntryFormData;

    expect(getKey?.({ id: 7 } as ShowEntryFormData)).toBe('entry-7');
    expect(getKey?.(unsaved)).toBe(getKey?.(unsaved));
  });
});
