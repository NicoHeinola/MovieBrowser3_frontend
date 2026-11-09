import type { PaginatedSearchRouteQuery } from '@/interfaces/search/PaginatedSearchRouteQuery';
import { describe, expect, it } from 'vitest';

import { getPaginatedSearchQuery } from '../getPaginatedSearchQuery';

const routeQuery: PaginatedSearchRouteQuery<string[]> = {
  sortValues: ['-created_at', 'title'],
  getFiltersQuery: (colors) => (colors.length > 0 ? { color: colors } : {}),
  getFiltersFromQuery: () => [],
};

describe('getPaginatedSearchQuery', () => {
  it('leaves out every default', () => {
    expect(
      getPaginatedSearchQuery({ search: '', filters: [], sort: '-created_at', page: 1 }, routeQuery, '-created_at'),
    ).toEqual({});
  });

  it('writes the search, filters, sort and page', () => {
    expect(
      getPaginatedSearchQuery({ search: 'car', filters: ['red'], sort: 'title', page: 3 }, routeQuery, '-created_at'),
    ).toEqual({ q: 'car', color: ['red'], sort: 'title', page: '3' });
  });
});
