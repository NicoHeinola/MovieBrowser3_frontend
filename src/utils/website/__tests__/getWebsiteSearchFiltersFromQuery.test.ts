import { describe, expect, it } from 'vitest';

import { getWebsiteSearchFiltersFromQuery } from '../getWebsiteSearchFiltersFromQuery';

describe('getWebsiteSearchFiltersFromQuery', () => {
  it('returns empty filters for an empty query', () => {
    expect(getWebsiteSearchFiltersFromQuery({})).toEqual({ tagIds: [], excludedTagIds: [] });
  });

  it('reads single and repeated tag ids', () => {
    expect(getWebsiteSearchFiltersFromQuery({ tag: ['1', '2'], exclude_tag: '3' })).toEqual({
      tagIds: [1, 2],
      excludedTagIds: [3],
    });
  });

  it('drops ids that are not positive integers', () => {
    expect(getWebsiteSearchFiltersFromQuery({ tag: ['abc', '0', '-1', '1.5', '4'] }).tagIds).toEqual([4]);
  });
});
