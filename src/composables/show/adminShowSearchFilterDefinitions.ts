import type { AdminShowSearchFilters } from './AdminShowSearchFilters';
import type { SearchFilterDefinition } from '@/composables/search/SearchFilterDefinition';

import { SearchFilterType } from '@/enums/search/SearchFilterType';
import { showSearchFilterDefinitions } from './showSearchFilterDefinitions';

/** The filters of the admin shows page: the show search's, plus the ones that find episodes without a video file. */
export const adminShowSearchFilterDefinitions: SearchFilterDefinition<keyof AdminShowSearchFilters>[] = [
  ...showSearchFilterDefinitions,
  {
    key: 'hasMissingVideoFile',
    type: SearchFilterType.Switch,
    param: 'has_missing_video_file',
    title: 'show.missingVideoFileFilter',
    label: 'show.onlyWithMissingVideoFile',
    api: { has_missing_video_file: 'true' },
  },
  {
    key: 'hasLostVideoFile',
    type: SearchFilterType.Switch,
    param: 'has_lost_video_file',
    title: 'show.lostVideoFileFilter',
    label: 'show.onlyWithLostVideoFile',
    api: { has_lost_video_file: 'true' },
  },
];
