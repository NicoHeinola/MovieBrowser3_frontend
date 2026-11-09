import type { ChipsFilterValue } from '@/interfaces/search/ChipsFilterValue';
import type { RangeFilterValue } from '@/interfaces/search/RangeFilterValue';
import type { SearchFilterDefinition } from '@/interfaces/search/SearchFilterDefinition';

import { describe, expect, it } from 'vitest';
import { computed } from 'vue';

import { SearchFilterType } from '@/enums/search/SearchFilterType';
import { createSearchFilters } from '../createSearchFilters';

interface TestFilters {
  color: ChipsFilterValue;
  stock: ChipsFilterValue;
  isNew: boolean;
}

/**
 * Provides no chips, because these tests never render the filters.
 * @returns The options.
 */
const useOptions = () => ({ options: computed(() => []) });

const definitions: SearchFilterDefinition<keyof TestFilters>[] = [
  {
    key: 'color',
    type: SearchFilterType.Chips,
    param: 'color',
    title: 'color',
    api: { include: 'colors.value', exclude: 'exclude_colors' },
    useOptions,
  },
  {
    key: 'stock',
    type: SearchFilterType.Chips,
    param: 'stock',
    title: 'stock',
    api: ({ included }) => (included.length > 0 ? { in_stock: '1' } : {}),
    useOptions,
  },
  { key: 'isNew', type: SearchFilterType.Switch, param: 'new', title: 'new', label: 'new', api: { age: 'new' } },
];

const emptyChips: ChipsFilterValue = { included: [], excluded: [] };
const emptyFilters: TestFilters = { color: emptyChips, stock: emptyChips, isNew: false };

/**
 * Builds the URL part of the filters with the given defaults.
 * @param defaultFilters - The default filters.
 * @returns The URL reader and writer.
 */
const getRouteQuery = (defaultFilters: Partial<TestFilters> = {}) =>
  createSearchFilters<TestFilters>(definitions, 'search', defaultFilters).routeQuery;

describe('createSearchFilters', () => {
  it('creates a new empty filter set every time', () => {
    const { createEmptyFilters } = createSearchFilters<TestFilters>(definitions, 'search');

    expect(createEmptyFilters()).toEqual(emptyFilters);
    expect(createEmptyFilters().color).not.toBe(createEmptyFilters().color);
  });

  describe('backend params', () => {
    const { getFilterParams } = createSearchFilters<TestFilters>(definitions, 'name');

    it('returns undefined when nothing filters the search', () => {
      expect(getFilterParams('', emptyFilters)).toBeUndefined();
    });

    it('sends the search term under the search param', () => {
      expect(getFilterParams('red', emptyFilters)).toEqual({ name: 'red' });
    });

    it('sends chips as arrays and a switch as its params', () => {
      const filters = { ...emptyFilters, color: { included: ['red'], excluded: ['blue'] }, isNew: true };

      expect(getFilterParams('', filters)).toEqual({
        'colors.value': ['red'],
        exclude_colors: ['blue'],
        age: 'new',
      });
    });

    it("uses the filter's own function when it has one", () => {
      expect(getFilterParams('', { ...emptyFilters, stock: { included: ['yes'], excluded: [] } })).toEqual({
        in_stock: '1',
      });
    });
  });

  describe('active count', () => {
    const { countActiveFilters } = createSearchFilters<TestFilters>(definitions, 'search');

    it('counts every chip and a switch that is on', () => {
      expect(countActiveFilters(emptyFilters)).toBe(0);
      expect(
        countActiveFilters({ ...emptyFilters, color: { included: ['a', 'b'], excluded: ['c'] }, isNew: true }),
      ).toBe(4);
    });

    it('counts defaults read from the URL state as active filters', () => {
      const search = createSearchFilters<TestFilters>(definitions, 'search', {
        color: { included: ['red'], excluded: [] },
      });

      expect(search.countActiveFilters(search.routeQuery.getFiltersFromQuery({}))).toBe(1);
    });
  });

  describe('URL query', () => {
    it('leaves untouched filters out', () => {
      expect(getRouteQuery().getFiltersQuery(emptyFilters)).toEqual({});
      expect(getRouteQuery().getFiltersFromQuery({})).toEqual(emptyFilters);
    });

    it('writes every filter in definition order and reads it back', () => {
      const filters = {
        color: { included: ['red', 'green'], excluded: ['blue'] },
        stock: { included: ['yes'], excluded: [] },
        isNew: true,
      };
      const query = { color: ['red', 'green'], exclude_color: ['blue'], stock: ['yes'], new: 'true' };

      expect(getRouteQuery().getFiltersQuery(filters)).toEqual(query);
      expect(Object.keys(getRouteQuery().getFiltersQuery(filters))).toEqual(Object.keys(query));
      expect(getRouteQuery().getFiltersFromQuery(query)).toEqual(filters);
    });

    it('reads a single value of a repeatable param', () => {
      expect(getRouteQuery().getFiltersFromQuery({ exclude_color: 'blue' }).color).toEqual({
        included: [],
        excluded: ['blue'],
      });
    });
  });

  describe('default chips', () => {
    const color = { included: [], excluded: ['red'] };
    const routeQuery = getRouteQuery({ color });

    it('stay out of the URL, in any order', () => {
      const defaults = { included: [], excluded: ['red', 'blue'] };

      expect(
        getRouteQuery({ color: defaults }).getFiltersQuery({
          ...emptyFilters,
          color: { included: [], excluded: ['blue', 'red'] },
        }),
      ).toEqual({});
    });

    it('apply without a param', () => {
      expect(routeQuery.getFiltersFromQuery({}).color).toEqual(color);
    });

    it('keep an unrelated filter out of the way', () => {
      expect(routeQuery.getFiltersFromQuery({ stock: 'yes' }).color).toEqual(color);
    });

    it('are replaced by either param of the filter', () => {
      expect(routeQuery.getFiltersFromQuery({ color: 'red' }).color).toEqual({ included: ['red'], excluded: [] });
      expect(routeQuery.getFiltersFromQuery({ exclude_color: 'blue' }).color).toEqual({
        included: [],
        excluded: ['blue'],
      });
    });

    it('write the whole filter once it differs', () => {
      expect(
        routeQuery.getFiltersQuery({ ...emptyFilters, color: { included: ['green'], excluded: ['red'] } }),
      ).toEqual({ color: ['green'], exclude_color: ['red'] });
    });

    it('stay cleared through an empty param', () => {
      expect(routeQuery.getFiltersQuery(emptyFilters)).toEqual({ color: '' });
      expect(routeQuery.getFiltersFromQuery({ color: '' }).color).toEqual(emptyChips);
    });

    it('do not treat a value named like a word as a marker', () => {
      expect(routeQuery.getFiltersFromQuery({ color: 'none' }).color.included).toEqual(['none']);
    });
  });

  describe('range filters', () => {
    const rangeDefinitions: SearchFilterDefinition<'episodes'>[] = [
      {
        key: 'episodes',
        type: SearchFilterType.Range,
        param: 'episodes',
        title: 'episodes',
        api: { min: 'min_episodes', max: 'max_episodes' },
        minLabel: 'min',
        maxLabel: 'max',
      },
    ];
    const search = createSearchFilters<{ episodes: RangeFilterValue }>(rangeDefinitions, 'search');

    it('starts empty and counts once when any bound is set', () => {
      expect(search.createEmptyFilters()).toEqual({ episodes: { min: null, max: null } });
      expect(search.countActiveFilters({ episodes: { min: null, max: null } })).toBe(0);
      expect(search.countActiveFilters({ episodes: { min: 1, max: 5 } })).toBe(1);
      expect(search.countActiveFilters({ episodes: { min: null, max: 0 } })).toBe(1);
    });

    it('sends only the set bounds, including zero', () => {
      expect(search.getFilterParams('', { episodes: { min: 0, max: null } })).toEqual({ min_episodes: '0' });
      expect(search.getFilterParams('', { episodes: { min: 2, max: 9 } })).toEqual({
        min_episodes: '2',
        max_episodes: '9',
      });
    });

    it('writes the set bounds to the URL and reads them back', () => {
      const { getFiltersQuery, getFiltersFromQuery } = search.routeQuery;

      expect(getFiltersQuery({ episodes: { min: 3, max: null } })).toEqual({
        episodes_min: '3',
        episodes_max: undefined,
      });
      expect(getFiltersFromQuery({ episodes_min: '3' })).toEqual({ episodes: { min: 3, max: null } });
      expect(getFiltersFromQuery({ episodes_max: 'abc' })).toEqual({ episodes: { min: null, max: null } });
      expect(getFiltersFromQuery({})).toEqual({ episodes: { min: null, max: null } });
      expect(getFiltersQuery({ episodes: { min: null, max: null } })).toEqual({});
    });
  });

  describe('default switches', () => {
    const routeQuery = getRouteQuery({ isNew: true });

    it('apply without a param', () => {
      expect(routeQuery.getFiltersFromQuery({}).isNew).toBe(true);
    });

    it('stay turned off through the URL', () => {
      expect(routeQuery.getFiltersQuery(emptyFilters)).toEqual({ new: 'false' });
      expect(routeQuery.getFiltersFromQuery({ new: 'false' }).isNew).toBe(false);
    });
  });
});
