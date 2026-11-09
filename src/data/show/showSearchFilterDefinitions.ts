import type { SearchFilterDefinition } from '@/interfaces/search/SearchFilterDefinition';
import type { ShowSearchFilters } from '@/interfaces/show/ShowSearchFilters';

import { useCategoryOptions } from '@/composables/show/useCategoryOptions';
import { useEntryWatchStatusOptions } from '@/composables/show/useEntryWatchStatusOptions';
import { useShowWatchStatusOptions } from '@/composables/show/useShowWatchStatusOptions';
import { SearchFilterType } from '@/enums/search/SearchFilterType';

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
