import type { ShowSearchFilters } from './ShowSearchFilters';
import type { SearchFilterDefinition } from '@/composables/search/SearchFilterDefinition';
import type { Category } from '@/interfaces/api/models/Category';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { CategoryQueryKey } from '@/enums/query/categoryQueryKey';
import { SearchFilterType } from '@/enums/search/SearchFilterType';
import { WatchStatus } from '@/enums/show/WatchStatus';
import { categoryService } from '@/services/show/categoryService';
import { getWatchStatusColor } from '@/utils/show/getWatchStatusColor';
import { getWatchStatusIcon } from '@/utils/show/getWatchStatusIcon';
import { MIXED_WATCH_STATUS } from '@/utils/show/mixedWatchStatus';
import { MIXED_WATCH_STATUS_COLOR } from '@/utils/show/mixedWatchStatusColor';
import { MIXED_WATCH_STATUS_ICON } from '@/utils/show/mixedWatchStatusIcon';

/**
 * Provides a chip for every watch status.
 * @returns The options.
 */
const useEntryWatchStatusOptions = () => {
  const { t } = useI18n();

  return {
    options: computed(() =>
      Object.values(WatchStatus).map((status) => ({
        value: status,
        text: t(`showEntry.watchStatus.${status}`),
        icon: getWatchStatusIcon(status),
        color: getWatchStatusColor(status),
      })),
    ),
  };
};

/**
 * Provides the watch status chips of a whole show, which adds one for shows whose entries differ.
 * @returns The options.
 */
const useShowWatchStatusOptions = () => {
  const { t } = useI18n();
  const { options } = useEntryWatchStatusOptions();

  return {
    options: computed(() => [
      ...options.value,
      {
        value: MIXED_WATCH_STATUS,
        text: t('show.mixed'),
        icon: MIXED_WATCH_STATUS_ICON,
        color: MIXED_WATCH_STATUS_COLOR,
      },
    ]),
  };
};

/**
 * Provides a chip for every category.
 * @returns The options and their loading state.
 */
const useCategoryOptions = () => {
  const categoriesQuery = useAPIQuery<PaginatedResponse<Category>>({
    queryKey: [CategoryQueryKey.ShowFilterCategories],
    queryFn: async () => {
      return await categoryService.list({
        sort: 'name',
        page: { number: 0, size: 0 },
      });
    },
    placeholderData: (previousData) => previousData,
  });

  return {
    options: computed(() =>
      (categoriesQuery.data.value?.data ?? []).map((category) => ({
        value: category.value,
        text: category.name,
        icon: category.icon,
      })),
    ),
    isPending: categoriesQuery.isPending,
  };
};

/** The filters of the show search, in drawer and URL order. */
export const showSearchFilterDefinitions: SearchFilterDefinition<keyof ShowSearchFilters>[] = [
  {
    key: 'watchStatus',
    type: SearchFilterType.Chips,
    param: 'watch_status',
    title: 'show.watchStatusFilter',
    hint: { keypath: 'show.filterAnyIncluded', include: 'any', exclude: 'none' },
    api: { include: 'watch_status', exclude: 'exclude_watch_status' },
    useOptions: useShowWatchStatusOptions,
  },
  {
    key: 'entryWatchStatus',
    type: SearchFilterType.Chips,
    param: 'entry_watch_status',
    title: 'show.entryWatchStatusFilter',
    hint: { keypath: 'show.filterAnyIncluded', include: 'any', exclude: 'none' },
    api: { include: 'entry_watch_status', exclude: 'exclude_entry_watch_status' },
    useOptions: useEntryWatchStatusOptions,
  },
  {
    key: 'category',
    type: SearchFilterType.Chips,
    param: 'category',
    title: 'show.categoriesFilter',
    hint: { keypath: 'show.filterEveryIncluded', include: 'every', exclude: 'none' },
    api: { include: 'categories.value', exclude: 'exclude_categories' },
    useOptions: useCategoryOptions,
    emptyText: 'show.noCategories',
  },
  {
    key: 'episodeCount',
    type: SearchFilterType.Range,
    param: 'episodes',
    title: 'show.episodeCountFilter',
    api: { min: 'min_episode_count', max: 'max_episode_count' },
    minLabel: 'show.minEpisodes',
    maxLabel: 'show.maxEpisodes',
  },
  {
    key: 'hasPreview',
    type: SearchFilterType.Switch,
    param: 'has_preview',
    title: 'show.previewFilter',
    label: 'show.onlyWithPreview',
    api: { preview_url: 'not_null' },
  },
];
