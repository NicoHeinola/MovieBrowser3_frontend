import type { ChipsFilterValue } from '@/composables/search/ChipsFilterValue';
import type { SearchFilterDefinition } from '@/composables/search/SearchFilterDefinition';
import type { SearchFilterValue } from '@/composables/search/SearchFilterValue';
import type { ShowSearchFilters } from '@/composables/show/ShowSearchFilters';
import type { UserSearchFilters } from '@/composables/user/UserSearchFilters';
import type { WebsiteSearchFilters } from '@/composables/website/WebsiteSearchFilters';
import type { Category } from '@/interfaces/api/models/Category';
import type { WebsiteTag } from '@/interfaces/api/models/WebsiteTag';
import type { Ref } from 'vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computed, defineComponent, h, ref } from 'vue';
import { createI18n } from 'vue-i18n';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import { VApp } from 'vuetify/components';

import { showSearchFilterDefinitions } from '@/composables/show/showSearchFilterDefinitions';
import { userSearchFilterDefinitions } from '@/composables/user/userSearchFilterDefinitions';
import { websiteSearchFilterDefinitions } from '@/composables/website/websiteSearchFilterDefinitions';
import { SearchFilterType } from '@/enums/search/SearchFilterType';
import { WatchStatus } from '@/enums/show/WatchStatus';
import enMessages from '@/plugins/i18n/en.json';
import { categoryService } from '@/services/show/categoryService';
import { websiteTagService } from '@/services/website/websiteTagService';
import { MIXED_WATCH_STATUS } from '@/utils/show/mixedWatchStatus';
import SearchFilterDrawer from '../SearchFilterDrawer.vue';

interface TestFilters {
  color: ChipsFilterValue;
  size: ChipsFilterValue;
  isNew: boolean;
}

vi.mock('@/composables/snackbar/useCommonSnackbar', () => ({
  useCommonSnackbar: () => ({ showAPIErrorSnackbar: vi.fn() }),
}));

vi.mock('@/services/show/categoryService', () => ({
  categoryService: {
    list: vi.fn(),
  },
}));

vi.mock('@/services/website/websiteTagService', () => ({
  websiteTagService: {
    list: vi.fn(),
  },
}));

vi.stubGlobal(
  'ResizeObserver',
  class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  },
);

const messages = {
  ...enMessages,
  test: {
    color: 'Color',
    size: 'Size',
    new: 'New',
    hint: 'Matches {any} included, {none} excluded.',
    empty: 'No colors',
  },
};

const meta = { current_page: 1, last_page: 1, per_page: 0, total: 0 };
const vuetify = createVuetify({ components });
const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: messages } });

/**
 * Mounts the drawer, keeping the filters in a ref like a page does.
 * @param definitions - The filters to show.
 * @param filters - The filters ref.
 * @returns The wrapper.
 */
const mountWith = <TFilters extends Record<keyof TFilters, SearchFilterValue>>(
  definitions: SearchFilterDefinition<keyof TFilters & string>[],
  filters: Ref<TFilters>,
) =>
  mount(
    defineComponent(
      () => () =>
        h(VApp, () =>
          h(SearchFilterDrawer<TFilters>, {
            definitions,
            filters: filters.value,
            'onUpdate:filters': (value: TFilters) => {
              filters.value = value;
            },
            activeFilterCount: 0,
            totalResults: 0,
            isLoading: false,
          }),
        ),
    ),
    {
      global: {
        plugins: [
          vuetify,
          i18n,
          [VueQueryPlugin, { queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }) }],
        ],
      },
    },
  );

/**
 * Mounts the drawer with two chips filters and one switch.
 * @param initialFilters - The filters to start with.
 * @param optionValues - The chip values.
 * @param isPending - Whether the options start as loading.
 * @returns The wrapper and the filters ref.
 */
const mountDrawer = (
  initialFilters: Partial<TestFilters> = {},
  optionValues = ref(['red', 'blue']),
  isPending = ref(false),
) => {
  const filters = ref<TestFilters>({
    color: { included: [], excluded: [] },
    size: { included: [], excluded: [] },
    isNew: false,
    ...initialFilters,
  });

  const definitions: SearchFilterDefinition<keyof TestFilters>[] = [
    {
      key: 'color',
      type: SearchFilterType.Chips,
      param: 'color',
      title: 'test.color',
      hint: { keypath: 'test.hint', include: 'any', exclude: 'none' },
      api: { include: 'colors', exclude: 'exclude_colors' },
      useOptions: () => ({
        options: computed(() => optionValues.value.map((value) => ({ value, text: value.toUpperCase() }))),
        isPending,
      }),
      emptyText: 'test.empty',
    },
    {
      key: 'size',
      type: SearchFilterType.Chips,
      param: 'size',
      title: 'test.size',
      api: { include: 'sizes', exclude: 'exclude_sizes' },
      useOptions: () => ({ options: computed(() => [{ value: 'small', text: 'SMALL' }]) }),
    },
    {
      key: 'isNew',
      type: SearchFilterType.Switch,
      param: 'new',
      title: 'test.new',
      label: 'test.new',
      api: { age: 'new' },
    },
  ];

  const wrapper = mountWith<TestFilters>(definitions, filters);

  return { wrapper, filters };
};

describe('SearchFilterDrawer', () => {
  it('renders titles, the hint with its highlighted words, chips and the switch', () => {
    const { wrapper } = mountDrawer();

    expect(wrapper.text()).toContain('Color');
    expect(wrapper.text()).toContain('Matches any included, none excluded.');
    expect(wrapper.text()).toContain('RED');
    expect(wrapper.text()).toContain('BLUE');
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
  });

  it('cycles a chip through include, exclude and off', async () => {
    const { wrapper, filters } = mountDrawer();
    const chip = () => wrapper.findAll('.v-chip').find((item) => item.text() === 'RED')!;

    await chip().trigger('click');
    expect(filters.value.color).toEqual({ included: ['red'], excluded: [] });

    await chip().trigger('click');
    expect(filters.value.color).toEqual({ included: [], excluded: ['red'] });

    await chip().trigger('click');
    expect(filters.value.color).toEqual({ included: [], excluded: [] });
  });

  it('turns the switch on without touching other filters', async () => {
    const { wrapper, filters } = mountDrawer({ color: { included: ['red'], excluded: [] } });

    await wrapper.find('input[type="checkbox"]').setValue(true);

    expect(filters.value.color).toEqual({ included: ['red'], excluded: [] });
    expect(filters.value.isNew).toBe(true);
  });

  it('shows the empty text without options', () => {
    const { wrapper } = mountDrawer({}, ref([]));

    expect(wrapper.text()).toContain('No colors');
  });

  it('drops a selected value that has no option', async () => {
    const { filters } = mountDrawer({ color: { included: ['red', 'green'], excluded: [] } });

    await flushPromises();

    expect(filters.value.color).toEqual({ included: ['red'], excluded: [] });
  });

  it('drops unknown values of two filters at once, without one undoing the other', async () => {
    const { filters } = mountDrawer({
      color: { included: ['green'], excluded: [] },
      size: { included: [], excluded: ['huge'] },
    });

    await flushPromises();

    expect(filters.value.color).toEqual({ included: [], excluded: [] });
    expect(filters.value.size).toEqual({ included: [], excluded: [] });
  });

  it('drops a value when its option disappears', async () => {
    const optionValues = ref(['red', 'blue']);
    const { filters } = mountDrawer({ color: { included: [], excluded: ['blue'] } }, optionValues);

    optionValues.value = ['red'];
    await flushPromises();

    expect(filters.value.color).toEqual({ included: [], excluded: [] });
  });

  it('keeps selected values while the options load', async () => {
    const { wrapper, filters } = mountDrawer({ color: { included: ['red'], excluded: [] } }, ref([]), ref(true));

    await flushPromises();

    expect(filters.value.color).toEqual({ included: ['red'], excluded: [] });
    expect(wrapper.find('.v-skeleton-loader').exists()).toBe(true);
  });

  describe('with the real definitions', () => {
    beforeEach(() => {
      const categories = [{ id: 1, name: 'Anime', value: 'anime', icon: 'mdi-sword' }] as Category[];
      const tags = [
        { id: 1, name: 'Docs', websites_count: 3 },
        { id: 2, name: 'Tools' },
      ] as WebsiteTag[];

      vi.mocked(categoryService.list).mockResolvedValue({ data: categories, meta });
      vi.mocked(websiteTagService.list).mockResolvedValue({ data: tags, meta });
    });

    it('shows the show filters and keeps only values that have a chip', async () => {
      const filters = ref<ShowSearchFilters>({
        watchStatus: { included: ['binged', MIXED_WATCH_STATUS], excluded: [WatchStatus.Completed] },
        entryWatchStatus: { included: [WatchStatus.Watching, MIXED_WATCH_STATUS], excluded: [] },
        category: { included: ['anime', 'deleted'], excluded: [] },
        episodeCount: { min: null, max: null },
        hasPreview: false,
      });
      const wrapper = mountWith<ShowSearchFilters>(showSearchFilterDefinitions, filters);

      await flushPromises();

      for (const text of [
        enMessages.show.watchStatusFilter,
        enMessages.show.entryWatchStatusFilter,
        enMessages.show.categoriesFilter,
        enMessages.show.episodeCountFilter,
        enMessages.show.minEpisodes,
        enMessages.show.maxEpisodes,
        enMessages.show.previewFilter,
        enMessages.show.onlyWithPreview,
        enMessages.showEntry.watchStatus.completed,
        enMessages.show.mixed,
        'Anime',
      ]) {
        expect(wrapper.text()).toContain(text);
      }

      expect(filters.value.watchStatus).toEqual({ included: [MIXED_WATCH_STATUS], excluded: [WatchStatus.Completed] });
      expect(filters.value.entryWatchStatus).toEqual({ included: [WatchStatus.Watching], excluded: [] });
      expect(filters.value.category).toEqual({ included: ['anime'], excluded: [] });
    });

    it('shows the website tags with their count and keeps tags by their id', async () => {
      const filters = ref<WebsiteSearchFilters>({ tag: { included: ['1', '99'], excluded: ['2'] } });
      const wrapper = mountWith<WebsiteSearchFilters>(websiteSearchFilterDefinitions, filters);

      await flushPromises();

      expect(wrapper.text()).toContain(enMessages.website.tagsFilter);
      expect(wrapper.text()).toContain('Docs (3)');
      expect(wrapper.text()).toContain('Tools');
      expect(filters.value.tag).toEqual({ included: ['1'], excluded: ['2'] });
    });

    it('shows the empty text without website tags', async () => {
      vi.mocked(websiteTagService.list).mockResolvedValue({ data: [], meta });

      const filters = ref<WebsiteSearchFilters>({ tag: { included: [], excluded: [] } });
      const wrapper = mountWith<WebsiteSearchFilters>(websiteSearchFilterDefinitions, filters);

      await flushPromises();

      expect(wrapper.text()).toContain(enMessages.website.noTags);
    });

    it('shows the admin chip and keeps only its value', async () => {
      const filters = ref<UserSearchFilters>({ role: { included: ['admin'], excluded: ['guest'] } });
      const wrapper = mountWith<UserSearchFilters>(userSearchFilterDefinitions, filters);

      await flushPromises();

      expect(wrapper.text()).toContain(enMessages.user.role);
      expect(wrapper.text()).toContain('Include for admins only, exclude for the rest.');
      expect(wrapper.text()).toContain(enMessages.user.admin);
      expect(filters.value.role).toEqual({ included: ['admin'], excluded: [] });
    });
  });
});
