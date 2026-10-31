import { describe, expect, it } from 'vitest';

import { WatchStatus } from '@/enums/show/WatchStatus';
import { getShowSearchFilterParams } from '../getShowSearchFilterParams';

const noFilters = {
  categories: [],
  excludedCategories: [],
  watchStatuses: [],
  excludedWatchStatuses: [],
  hasPreview: false,
};

describe('getShowSearchFilterParams', () => {
  it('returns undefined without a search term or filters', () => {
    expect(getShowSearchFilterParams('', noFilters)).toBeUndefined();
  });

  it('maps the search term and every filter to backend params', () => {
    expect(
      getShowSearchFilterParams('naruto', {
        categories: ['anime', 'action'],
        excludedCategories: ['horror'],
        watchStatuses: [WatchStatus.Watching, WatchStatus.OnHold],
        excludedWatchStatuses: [WatchStatus.Dropped],
        hasPreview: true,
      }),
    ).toEqual({
      search: 'naruto',
      'categories.value': ['anime', 'action'],
      exclude_categories: ['horror'],
      watch_status: ['watching', 'on_hold'],
      exclude_watch_status: ['dropped'],
      preview_url: 'not_null',
    });
  });
});
