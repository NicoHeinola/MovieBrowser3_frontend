import { describe, expect, it } from 'vitest';

import { getUserSearchFiltersFromQuery } from '../getUserSearchFiltersFromQuery';

describe('getUserSearchFiltersFromQuery', () => {
  it('returns empty filters for an empty query', () => {
    expect(getUserSearchFiltersFromQuery({})).toEqual({ admin: null });
  });

  it('reads 1 and 0 as included and excluded admins', () => {
    expect(getUserSearchFiltersFromQuery({ admin: '1' })).toEqual({ admin: 'include' });
    expect(getUserSearchFiltersFromQuery({ admin: '0' })).toEqual({ admin: 'exclude' });
  });

  it('ignores unknown values', () => {
    expect(getUserSearchFiltersFromQuery({ admin: 'yes' })).toEqual({ admin: null });
  });
});
