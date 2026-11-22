import type { SearchFilterDefinition } from '@/interfaces/search/SearchFilterDefinition';
import type { SearchFilterValue } from '@/interfaces/search/SearchFilterValue';
import type { LocationQuery, LocationQueryRaw } from 'vue-router';

import { SearchFilterType } from '@/enums/search/SearchFilterType';
import { getSearchFilterApiParams } from './getSearchFilterApiParams';
import { searchFilterQuery } from './searchFilterQuery';

/**
 * Builds the filter options of `usePaginatedSearch` from the domain's filter definitions.
 * @param definitions - The domain's filters, in URL order.
 * @param searchParam - The backend `filter` param of the search term.
 * @param defaultFilters - Filters applied until the user changes them. They stay out of the URL, count as active, and
 * clearing the filters removes them too. They are read from the URL state, so they need `routeQuery` to apply.
 * @returns The filter options, with the URL part under `routeQuery`.
 */
export const createSearchFilters = <TFilters extends Record<keyof TFilters, SearchFilterValue>>(
  definitions: SearchFilterDefinition<keyof TFilters & string>[],
  searchParam: string,
  defaultFilters: Partial<TFilters> = {},
) => {
  /**
   * Creates the value of a filter that filters nothing.
   * @param definition - The filter.
   * @returns The empty value.
   */
  const createEmptyFilterValue = (definition: SearchFilterDefinition): SearchFilterValue => {
    switch (definition.type) {
      case SearchFilterType.Switch: {
        return false;
      }
      case SearchFilterType.Range: {
        return { min: null, max: null };
      }
      case SearchFilterType.Choice: {
        return definition.emptyValue;
      }
      default: {
        return { included: [], excluded: [] };
      }
    }
  };

  /**
   * Creates a filter set that filters nothing.
   * @returns The empty filters.
   */
  const createEmptyFilters = (): TFilters =>
    Object.fromEntries(
      definitions.map((definition) => [definition.key, createEmptyFilterValue(definition)]),
    ) as TFilters;

  const defaults: TFilters = { ...createEmptyFilters(), ...defaultFilters };

  /**
   * Builds the backend `filter` params.
   * @param searchTerm - The trimmed search term, or an empty string for none.
   * @param filters - The selected filters.
   * @returns The filter params, or undefined when nothing filters the search.
   */
  const getFilterParams = (searchTerm: string, filters: TFilters): Record<string, string | string[]> | undefined => {
    const params: Record<string, string | string[]> = searchTerm ? { [searchParam]: searchTerm } : {};

    for (const definition of definitions) {
      Object.assign(params, getSearchFilterApiParams(definition, filters[definition.key]));
    }

    return Object.keys(params).length > 0 ? params : undefined;
  };

  /**
   * Counts the active filters, for the filter button badge: each chip, each switch that is on and each choice of
   * something other than its empty value.
   * @param filters - The selected filters.
   * @returns The number of active filters.
   */
  const countActiveFilters = (filters: TFilters): number =>
    definitions.reduce((count, definition) => {
      const value: SearchFilterValue = filters[definition.key];

      if (definition.type === SearchFilterType.Choice) {
        return count + Number(value !== definition.emptyValue);
      }

      // A switch counts while it is on; any other value that is not an object (only a choice, handled above) never
      if (typeof value !== 'object') {
        return count + Number(value === true);
      }

      // A range counts once, however many of its bounds are set.
      if ('min' in value) {
        return count + Number(value.min !== null || value.max !== null);
      }

      return count + value.included.length + value.excluded.length;
    }, 0);

  /**
   * Writes the filters as URL query params.
   * @param filters - The selected filters.
   * @returns The query params of the filters that differ from the defaults.
   */
  const getFiltersQuery = (filters: TFilters): LocationQueryRaw => {
    const query: LocationQueryRaw = {};

    for (const definition of definitions) {
      Object.assign(query, searchFilterQuery.write(definition, filters[definition.key], defaults[definition.key]));
    }

    return query;
  };

  /**
   * Reads the filters from URL query params.
   * @param query - The route query.
   * @returns The filters, using the defaults for every filter the query leaves out.
   */
  const getFiltersFromQuery = (query: LocationQuery): TFilters =>
    Object.fromEntries(
      definitions.map((definition) => [
        definition.key,
        searchFilterQuery.read(definition, query, defaults[definition.key]),
      ]),
    ) as TFilters;

  return {
    createEmptyFilters,
    getFilterParams,
    countActiveFilters,
    routeQuery: { getFiltersQuery, getFiltersFromQuery },
  };
};
