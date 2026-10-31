import { describe, expect, it } from 'vitest';

import { getUserSearchFilterParams } from '../getUserSearchFilterParams';

describe('getUserSearchFilterParams', () => {
  it('returns undefined when nothing filters the search', () => {
    expect(getUserSearchFilterParams('', { admin: null })).toBeUndefined();
  });

  it('filters by username and admins', () => {
    expect(getUserSearchFilterParams('ada', { admin: 'include' })).toEqual({ username: 'ada', is_admin: '1' });
  });

  it('filters to regular users when admins are excluded', () => {
    expect(getUserSearchFilterParams('', { admin: 'exclude' })).toEqual({ is_admin: '0' });
  });
});
