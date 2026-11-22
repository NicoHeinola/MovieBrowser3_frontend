import type { NyaaSearchFilters } from '@/interfaces/nyaa/NyaaSearchFilters';
import type { SearchFilterDefinition } from '@/interfaces/search/SearchFilterDefinition';

import { useNyaaCategoryOptions } from '@/composables/nyaa/useNyaaCategoryOptions';
import { useNyaaTrustOptions } from '@/composables/nyaa/useNyaaTrustOptions';
import { SearchFilterType } from '@/enums/search/SearchFilterType';

/** The nyaa tab's filters. Their `api` params are nyaa's own query params, and clearing picks "everything". */
export const nyaaSearchFilterDefinitions: SearchFilterDefinition<keyof NyaaSearchFilters>[] = [
  {
    key: 'category',
    type: SearchFilterType.Choice,
    param: 'category',
    title: 'torrents.nyaa.category',
    api: 'c',
    emptyValue: '0_0',
    useOptions: useNyaaCategoryOptions,
  },
  {
    key: 'trust',
    type: SearchFilterType.Choice,
    param: 'trust',
    title: 'torrents.nyaa.filter',
    api: 'f',
    emptyValue: '0',
    useOptions: useNyaaTrustOptions,
  },
];
