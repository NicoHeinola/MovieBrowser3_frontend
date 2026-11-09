import type { EpisodeFormData } from '../EpisodeFormData';
import type { ShowEntryFormData } from '../ShowEntryFormData';

import { shallowMount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, nextTick } from 'vue';
import { createI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';

import { useSortableItems } from '@/composables/sortable/useSortableItems';
import { deepClone } from '@/utils/clone/deepClone';
import ShowEntriesFormPart from '../ShowEntriesFormPart.vue';
import ShowEntryEpisodesFormPart from '../ShowEntryEpisodesFormPart.vue';
import ShowEntryExpansionPanel from '../ShowEntryExpansionPanel.vue';

vi.mock('@/composables/sortable/useSortableItems', () => ({
  useSortableItems: vi.fn(() => []),
}));

// The entry panel takes dropped files; without a drag provider around it, the library would throw.
vi.mock('@vue-dnd-kit/core', () => ({
  makeDroppable: () => ({ isOver: { value: false }, isAccepting: { value: false } }),
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

  it("offers the other entries in an episode's move menu and hands the episode up when one is picked", async () => {
    vi.mocked(useSortableItems).mockImplementation((_zone, options) => computed(() => options.getItems()));
    const episode = { id: 2, name: 'Movie', sequence_number: 0 } as EpisodeFormData;
    const movie = { id: 4, name: 'Movie', sort_order: 1, episodes: [] } as ShowEntryFormData;
    const passThrough = { template: '<div><slot /></div>' };
    // The menu renders its activator and list inline, so both can be found.
    const menu = { template: '<div><slot name="activator" :props="{}" /><slot /></div>' };
    const wrapper = shallowMount(ShowEntryEpisodesFormPart, {
      props: { entry: { episodes: [episode] } as ShowEntryFormData, moveTargets: [movie] },
      global: {
        ...global,
        stubs: { FormItemList: passThrough, SortableItem: passThrough, VMenu: menu, VList: passThrough },
      },
    });

    const [target] = wrapper.findAllComponents({ name: 'VListItem' });
    expect(target!.props('title')).toBe('Movie');

    target!.vm.$emit('click');
    expect(wrapper.emitted('move')).toEqual([[episode, movie]]);
  });

  it('turns the move button off when the show has no other entry', () => {
    vi.mocked(useSortableItems).mockImplementation((_zone, options) => computed(() => options.getItems()));
    const passThrough = { template: '<div><slot /></div>' };
    const menu = { template: '<div><slot name="activator" :props="{}" /><slot /></div>' };
    const wrapper = shallowMount(ShowEntryEpisodesFormPart, {
      props: { entry: { episodes: [{ id: 2, name: 'A', sequence_number: 0 }] } as ShowEntryFormData },
      global: { ...global, stubs: { FormItemList: passThrough, SortableItem: passThrough, VMenu: menu } },
    });

    const moveButton = wrapper
      .findAllComponents({ name: 'VBtn' })
      .find((button) => button.props('icon') === 'mdi-folder-move-outline');
    expect(moveButton!.props('disabled')).toBe(true);
  });

  it('passes an episode move from the episodes part up to the entries', () => {
    const passThrough = { template: '<div><slot /></div>' };
    const movie = { id: 4, name: 'Movie', sort_order: 1, episodes: [] } as ShowEntryFormData;
    const episode = { id: 2, name: 'Movie', sequence_number: 0 } as EpisodeFormData;
    const wrapper = shallowMount(ShowEntryExpansionPanel, {
      props: { entry: { id: 1, name: 'Season 1', sort_order: 0, episodes: [episode] } as never, moveTargets: [movie] },
      global: {
        ...global,
        // Render the panel's content, where the episodes part sits.
        stubs: {
          VExpansionPanels: passThrough,
          VExpansionPanel: { template: '<div><slot name="text" /></div>' },
          VRow: passThrough,
          VCol: passThrough,
          VTabsWindow: passThrough,
          VTabsWindowItem: passThrough,
        },
      },
    });
    const episodesPart = wrapper.findComponent(ShowEntryEpisodesFormPart);

    expect(episodesPart.props('moveTargets')).toEqual([movie]);
    episodesPart.vm.$emit('move', episode, movie);

    expect(wrapper.emitted('move-episode')).toEqual([[episode, movie]]);
  });

  it('moves an episode to the end of another entry and renumbers both', async () => {
    vi.mocked(useSortableItems).mockImplementation((_zone, options) => computed(() => options.getItems()));
    const moved = { id: 2, name: 'Movie', sequence_number: 0 } as EpisodeFormData;
    const second = { id: 3, name: 'B', sequence_number: 1 };
    const season = { id: 1, name: 'Season 1', sort_order: 0, episodes: [moved, second] };
    const movie = { id: 4, name: 'Movie', sort_order: 1, episodes: [{ id: 5, name: 'C', sequence_number: 0 }] };
    const show = { entries: [season, movie] as ShowEntryFormData[] };
    const passThrough = { template: '<div><slot /></div>' };
    const wrapper = shallowMount(ShowEntriesFormPart, {
      props: { show },
      global: { ...global, stubs: { FormItemList: passThrough, SortableItem: passThrough } },
    });
    const [seasonPanel] = wrapper.findAllComponents(ShowEntryExpansionPanel);

    expect(seasonPanel!.props('moveTargets')).toEqual([movie]);
    seasonPanel!.vm.$emit('move-episode', moved, movie);

    expect(season.episodes).toEqual([{ id: 3, name: 'B', sequence_number: 0 }]);
    expect(movie.episodes).toEqual([
      { id: 5, name: 'C', sequence_number: 0 },
      { id: 2, name: 'Movie', sequence_number: 1 },
    ]);
  });

  it('keys saved rows by id and unsaved rows by a stable key', () => {
    shallowMount(ShowEntriesFormPart, { props: { show: { entries: [] } }, global });

    const { getKey } = getOptions();
    const unsaved = { name: 'B' } as ShowEntryFormData;

    expect(getKey?.({ id: 7 } as ShowEntryFormData)).toBe('entry-7');
    expect(getKey?.(unsaved)).toBe(getKey?.(unsaved));
  });

  it('keeps a saved entry open when the show reloads into new objects, as it does after a save', async () => {
    // Render the rows for real, so their panels can be found.
    vi.mocked(useSortableItems).mockImplementation((_zone, options) => computed(() => options.getItems()));
    const show = { entries: [{ id: 1, name: 'A', sort_order: 0, episodes: [] }] as ShowEntryFormData[] };
    const passThrough = { template: '<div><slot /></div>' };
    const wrapper = shallowMount(ShowEntriesFormPart, {
      props: { show },
      global: { ...global, stubs: { FormItemList: passThrough, SortableItem: passThrough } },
    });
    const getPanel = () => wrapper.findComponent(ShowEntryExpansionPanel);

    getPanel().vm.$emit('update:expanded', true);
    await nextTick();
    expect(getPanel().props('expanded')).toBe(true);

    await wrapper.setProps({ show: deepClone(show) });
    expect(getPanel().props('expanded')).toBe(true);
  });
});
