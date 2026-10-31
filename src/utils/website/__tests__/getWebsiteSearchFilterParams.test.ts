import { describe, expect, it } from 'vitest';

import { getWebsiteSearchFilterParams } from '../getWebsiteSearchFilterParams';

const noFilters = { tagIds: [], excludedTagIds: [] };

describe('getWebsiteSearchFilterParams', () => {
  it('returns undefined without a search term or filters', () => {
    expect(getWebsiteSearchFilterParams('', noFilters)).toBeUndefined();
  });

  it('maps the search term and tag filters to backend params', () => {
    expect(getWebsiteSearchFilterParams('vue docs', { tagIds: [1, 2], excludedTagIds: [3] })).toEqual({
      search: 'vue docs',
      'tags.id': ['1', '2'],
      exclude_tags: ['3'],
    });
  });

  it('sends a single tag as an array too', () => {
    expect(getWebsiteSearchFilterParams('', { tagIds: [], excludedTagIds: [4] })).toEqual({ exclude_tags: ['4'] });
  });
});
