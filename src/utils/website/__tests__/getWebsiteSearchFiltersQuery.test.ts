import { describe, expect, it } from 'vitest';

import { getWebsiteSearchFiltersQuery } from '../getWebsiteSearchFiltersQuery';

describe('getWebsiteSearchFiltersQuery', () => {
  it('returns an empty query without filters', () => {
    expect(getWebsiteSearchFiltersQuery({ tagIds: [], excludedTagIds: [] })).toEqual({});
  });

  it('writes the included and excluded tag ids', () => {
    expect(getWebsiteSearchFiltersQuery({ tagIds: [1, 2], excludedTagIds: [3] })).toEqual({
      tag: ['1', '2'],
      exclude_tag: ['3'],
    });
  });
});
