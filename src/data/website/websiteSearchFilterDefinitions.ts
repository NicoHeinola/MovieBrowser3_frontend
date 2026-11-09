import type { SearchFilterDefinition } from '@/interfaces/search/SearchFilterDefinition';
import type { WebsiteSearchFilters } from '@/interfaces/website/WebsiteSearchFilters';

import { useWebsiteTagOptions } from '@/composables/website/useWebsiteTagOptions';
import { SearchFilterType } from '@/enums/search/SearchFilterType';

/** The filters of the website search, in drawer and URL order. */
export const websiteSearchFilterDefinitions: SearchFilterDefinition<keyof WebsiteSearchFilters>[] = [
  {
    key: 'tag',
    type: SearchFilterType.Chips,
    param: 'tag',
    title: 'website.tagsFilter',
    hint: { keypath: 'website.tagMatchesEvery', include: 'every', exclude: 'none' },
    api: { include: 'tags.id', exclude: 'exclude_tags' },
    useOptions: useWebsiteTagOptions,
    emptyText: 'website.noTags',
  },
];
