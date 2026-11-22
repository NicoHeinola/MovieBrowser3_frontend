import { describe, expect, it } from 'vitest';

import { SearchFilterType } from '@/enums/search/SearchFilterType';
import { nekoBtSearchFilterDefinitions } from '../nekoBtSearchFilterDefinitions';

describe('nekoBtSearchFilterDefinitions', () => {
  it('has unique keys and URL params, none of them the search, sort or page params', () => {
    const keys = nekoBtSearchFilterDefinitions.map((definition) => definition.key);
    const params = nekoBtSearchFilterDefinitions.map((definition) => definition.param);

    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(params).size).toBe(params.length);
    expect(params).not.toContain('q');
    expect(params).not.toContain('sort');
    expect(params).not.toContain('page');
  });

  it('turns excluded levels into the levels left, as nekoBT only takes allowed ones', () => {
    const level = nekoBtSearchFilterDefinitions.find((definition) => definition.key === 'level');
    if (level?.type !== SearchFilterType.Chips || typeof level.api !== 'function') {
      throw new Error('The level filter is a chips filter with its own params');
    }

    expect(level.api({ included: [], excluded: ['official'] })).toEqual({
      levels: ['slight_modifications', 'small_scale_fansub', 'full_scale_fansub'],
    });
    expect(level.api({ included: [], excluded: [] })).toEqual({});
  });
});
