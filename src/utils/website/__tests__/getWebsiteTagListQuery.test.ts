import { describe, expect, it } from 'vitest';

import { getWebsiteTagListQuery } from '../getWebsiteTagListQuery';

describe('getWebsiteTagListQuery', () => {
  it('lists every tag by name when showing all rows without a search', () => {
    expect(getWebsiteTagListQuery('  ', 3, -1, [])).toEqual({ sort: 'name', page: { number: 0, size: 0 } });
  });

  it('pages and searches by the trimmed term', () => {
    expect(getWebsiteTagListQuery(' doc ', 2, 25, [{ key: 'name', order: 'asc' }])).toEqual({
      filter: { search: 'doc' },
      sort: 'name',
      page: { number: 2, size: 25 },
    });
  });

  it('sorts by name descending', () => {
    expect(getWebsiteTagListQuery('', 1, 25, [{ key: 'name', order: 'desc' }]).sort).toBe('-name');
  });
});
