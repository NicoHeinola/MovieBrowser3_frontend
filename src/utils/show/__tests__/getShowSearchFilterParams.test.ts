import { describe, expect, it } from 'vitest';

import { WatchStatus } from '@/enums/show/WatchStatus';
import { getShowSearchFilterParams } from '../getShowSearchFilterParams';

const noFilters = { categories: [], watchStatuses: [], hasPreview: false };

describe('getShowSearchFilterParams', () => {
  it('returns undefined without a search term or filters', () => {
    expect(getShowSearchFilterParams('', noFilters)).toBeUndefined();
  });

  it('maps the search term and every filter to backend params', () => {
    expect(
      getShowSearchFilterParams('naruto', {
        categories: ['anime', 'action'],
        watchStatuses: [WatchStatus.Watching, WatchStatus.OnHold],
        hasPreview: true,
      }),
    ).toEqual({
      search: 'naruto',
      'categories.value': ['anime', 'action'],
      watch_status: ['watching', 'on_hold'],
      preview_url: 'not_null',
    });
  });
});
