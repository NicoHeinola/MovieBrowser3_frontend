import type { SearchFilterDefinition } from '@/interfaces/search/SearchFilterDefinition';

import { describe, expect, it } from 'vitest';
import { computed } from 'vue';

import { SearchFilterType } from '@/enums/search/SearchFilterType';
import { getSearchFilterApiParams } from '../getSearchFilterApiParams';

/**
 * Provides no chips, because these tests never render the filters.
 * @returns The options.
 */
const useOptions = () => ({ options: computed(() => []) });

const chips: SearchFilterDefinition = {
  key: 'color',
  type: SearchFilterType.Chips,
  param: 'color',
  title: 'color',
  api: { include: 'colors', exclude: 'exclude_colors' },
  useOptions,
};

const customChips: SearchFilterDefinition = {
  key: 'stock',
  type: SearchFilterType.Chips,
  param: 'stock',
  title: 'stock',
  api: ({ included }) => (included.length > 0 ? { in_stock: '1' } : {}),
  useOptions,
};

const toggle: SearchFilterDefinition = {
  key: 'isNew',
  type: SearchFilterType.Switch,
  param: 'new',
  title: 'new',
  label: 'new',
  api: { age: 'new' },
};

const choice: SearchFilterDefinition = {
  key: 'category',
  type: SearchFilterType.Choice,
  param: 'category',
  title: 'category',
  api: 'c',
  emptyValue: 'all',
  useOptions,
};

const range: SearchFilterDefinition = {
  key: 'year',
  type: SearchFilterType.Range,
  param: 'year',
  title: 'year',
  minLabel: 'min',
  maxLabel: 'max',
  api: { min: 'year_from', max: 'year_to' },
};

describe('getSearchFilterApiParams', () => {
  it('sends included and excluded chips, leaving out empty lists', () => {
    expect(getSearchFilterApiParams(chips, { included: ['red'], excluded: ['blue'] })).toEqual({
      colors: ['red'],
      exclude_colors: ['blue'],
    });
    expect(getSearchFilterApiParams(chips, { included: [], excluded: ['blue'] })).toEqual({ exclude_colors: ['blue'] });
    expect(getSearchFilterApiParams(chips, { included: [], excluded: [] })).toEqual({});
  });

  it('lets a chips filter build its own params', () => {
    expect(getSearchFilterApiParams(customChips, { included: ['yes'], excluded: [] })).toEqual({ in_stock: '1' });
  });

  it('sends a switch only while it is on', () => {
    expect(getSearchFilterApiParams(toggle, true)).toEqual({ age: 'new' });
    expect(getSearchFilterApiParams(toggle, false)).toEqual({});
  });

  it('sends each range bound that is set', () => {
    expect(getSearchFilterApiParams(range, { min: 1990, max: 2000 })).toEqual({ year_from: '1990', year_to: '2000' });
    expect(getSearchFilterApiParams(range, { min: null, max: 0 })).toEqual({ year_to: '0' });
    expect(getSearchFilterApiParams(range, { min: null, max: null })).toEqual({});
  });

  it('sends a choice under its param, unless it is the empty value', () => {
    expect(getSearchFilterApiParams(choice, '1_2')).toEqual({ c: '1_2' });
    expect(getSearchFilterApiParams(choice, 'all')).toEqual({});
  });
});
