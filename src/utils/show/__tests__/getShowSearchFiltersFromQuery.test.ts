import { describe, expect, it } from 'vitest';

import { WatchStatus } from '@/enums/show/WatchStatus';
import { getShowSearchFiltersFromQuery } from '../getShowSearchFiltersFromQuery';

describe('getShowSearchFiltersFromQuery', () => {
  it('returns empty filters for an empty query', () => {
    expect(getShowSearchFiltersFromQuery({})).toEqual({
      categories: [],
      excludedCategories: [],
      watchStatuses: [],
      excludedWatchStatuses: [],
      hasPreview: false,
    });
  });

  it('reads single and repeated params', () => {
    expect(
      getShowSearchFiltersFromQuery({
        category: ['anime', 'action'],
        exclude_category: 'horror',
        watch_status: 'watching',
        exclude_watch_status: ['dropped', 'on_hold'],
        has_preview: 'true',
      }),
    ).toEqual({
      categories: ['anime', 'action'],
      excludedCategories: ['horror'],
      watchStatuses: [WatchStatus.Watching],
      excludedWatchStatuses: [WatchStatus.Dropped, WatchStatus.OnHold],
      hasPreview: true,
    });
  });

  it('drops unknown watch statuses', () => {
    const filters = getShowSearchFiltersFromQuery({ watch_status: ['watching', 'binged'] });

    expect(filters.watchStatuses).toEqual([WatchStatus.Watching]);
  });
});
