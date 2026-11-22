import type { ChipsFilterValue } from '@/interfaces/search/ChipsFilterValue';
import type { RangeFilterValue } from '@/interfaces/search/RangeFilterValue';
import type { SearchFilterDefinition } from '@/interfaces/search/SearchFilterDefinition';

import { describe, expect, it } from 'vitest';
import { computed } from 'vue';

import { SearchFilterType } from '@/enums/search/SearchFilterType';
import { searchFilterQuery } from '../searchFilterQuery';

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

const toggle: SearchFilterDefinition = {
  key: 'isNew',
  type: SearchFilterType.Switch,
  param: 'new',
  title: 'new',
  label: 'new',
  api: { age: 'new' },
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

const noChips: ChipsFilterValue = { included: [], excluded: [] };
const redChips: ChipsFilterValue = { included: ['red'], excluded: [] };
const noRange: RangeFilterValue = { min: null, max: null };

describe('searchFilterQuery', () => {
  describe('write', () => {
    it('leaves a filter at its default out of the URL, in any order', () => {
      const defaults: ChipsFilterValue = { included: ['red', 'green'], excluded: [] };

      expect(searchFilterQuery.write(chips, { included: ['green', 'red'], excluded: [] }, defaults)).toEqual({});
      expect(searchFilterQuery.write(toggle, false, false)).toEqual({});
      expect(searchFilterQuery.write(range, noRange, noRange)).toEqual({});
    });

    it('writes included and excluded chips to their own params', () => {
      expect(searchFilterQuery.write(chips, { included: ['red'], excluded: ['blue'] }, noChips)).toEqual({
        color: ['red'],
        exclude_color: ['blue'],
      });
    });

    it('writes an empty param when a default selection is cleared', () => {
      expect(searchFilterQuery.write(chips, noChips, redChips)).toEqual({ color: '' });
    });

    it('writes a switch and both range bounds', () => {
      expect(searchFilterQuery.write(toggle, true, false)).toEqual({ new: 'true' });
      expect(searchFilterQuery.write(range, { min: 1990, max: null }, noRange)).toEqual({
        year_min: '1990',
        year_max: undefined,
      });
    });
  });

  describe('read', () => {
    it('uses the default when the URL has none of the filter params', () => {
      expect(searchFilterQuery.read(chips, {}, redChips)).toEqual(redChips);
      expect(searchFilterQuery.read(toggle, {}, true)).toBe(true);
      expect(searchFilterQuery.read(range, {}, { min: 1, max: 2 })).toEqual({ min: 1, max: 2 });
    });

    it('reads chips, keeping a cleared default cleared', () => {
      expect(searchFilterQuery.read(chips, { color: ['red'], exclude_color: 'blue' }, noChips)).toEqual({
        included: ['red'],
        excluded: ['blue'],
      });
      expect(searchFilterQuery.read(chips, { color: '' }, redChips)).toEqual(noChips);
    });

    it('reads a switch and range bounds', () => {
      expect(searchFilterQuery.read(toggle, { new: 'true' }, false)).toBe(true);
      expect(searchFilterQuery.read(toggle, { new: 'false' }, true)).toBe(false);
      expect(searchFilterQuery.read(range, { year_min: '1990' }, noRange)).toEqual({ min: 1990, max: null });
    });

    it('reads back what it writes', () => {
      const value: ChipsFilterValue = { included: ['red'], excluded: ['blue'] };
      const query = searchFilterQuery.write(chips, value, noChips) as Record<string, string[]>;

      expect(searchFilterQuery.read(chips, query, noChips)).toEqual(value);
    });
  });
});
