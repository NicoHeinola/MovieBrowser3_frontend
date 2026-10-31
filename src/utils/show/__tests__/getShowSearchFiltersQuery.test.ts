import { describe, expect, it } from 'vitest';

import { WatchStatus } from '@/enums/show/WatchStatus';
import { getShowSearchFiltersQuery } from '../getShowSearchFiltersQuery';

describe('getShowSearchFiltersQuery', () => {
  it('returns an empty query without filters', () => {
    expect(
      getShowSearchFiltersQuery({
        categories: [],
        excludedCategories: [],
        watchStatuses: [],
        excludedWatchStatuses: [],
        hasPreview: false,
      }),
    ).toEqual({});
  });

  it('writes every filter', () => {
    expect(
      getShowSearchFiltersQuery({
        categories: ['anime', 'action'],
        excludedCategories: ['horror'],
        watchStatuses: [WatchStatus.Watching],
        excludedWatchStatuses: [WatchStatus.Dropped],
        hasPreview: true,
      }),
    ).toEqual({
      category: ['anime', 'action'],
      exclude_category: ['horror'],
      watch_status: ['watching'],
      exclude_watch_status: ['dropped'],
      has_preview: 'true',
    });
  });
});
