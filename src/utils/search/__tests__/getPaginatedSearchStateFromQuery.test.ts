import type { PaginatedSearchRouteQuery } from '@/composables/search/PaginatedSearchRouteQuery';
import { describe, expect, it } from 'vitest';

import { getQueryStrings } from '@/utils/route/getQueryStrings';
import { getPaginatedSearchStateFromQuery } from '../getPaginatedSearchStateFromQuery';

const routeQuery: PaginatedSearchRouteQuery<string[]> = {
  sortValues: ['-created_at', 'title'],
  getFiltersQuery: () => ({}),
  getFiltersFromQuery: (query) => getQueryStrings(query.color),
};

describe('getPaginatedSearchStateFromQuery', () => {
  it('falls back to the defaults for an empty query', () => {
    expect(getPaginatedSearchStateFromQuery({}, routeQuery, '-created_at')).toEqual({
      search: '',
      filters: [],
      sort: '-created_at',
      page: 1,
    });
  });

  it('reads the trimmed search, filters, sort and page', () => {
    const query = { q: ' car ', color: ['red', 'blue'], sort: 'title', page: '3' };

    expect(getPaginatedSearchStateFromQuery(query, routeQuery, '-created_at')).toEqual({
      search: 'car',
      filters: ['red', 'blue'],
      sort: 'title',
      page: 3,
    });
  });

  it('ignores an unknown sort and an invalid page', () => {
    for (const page of ['0', '-2', '1.5', 'abc']) {
      const state = getPaginatedSearchStateFromQuery({ sort: 'password', page }, routeQuery, '-created_at');

      expect(state.sort).toBe('-created_at');
      expect(state.page).toBe(1);
    }
  });
});
