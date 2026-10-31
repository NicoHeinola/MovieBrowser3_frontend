import { describe, expect, it } from 'vitest';

import { getUserSearchFiltersQuery } from '../getUserSearchFiltersQuery';

describe('getUserSearchFiltersQuery', () => {
  it('leaves out an unset admin filter', () => {
    expect(getUserSearchFiltersQuery({ admin: null })).toEqual({});
  });

  it('writes included and excluded admins as 1 and 0', () => {
    expect(getUserSearchFiltersQuery({ admin: 'include' })).toEqual({ admin: '1' });
    expect(getUserSearchFiltersQuery({ admin: 'exclude' })).toEqual({ admin: '0' });
  });
});
