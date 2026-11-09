import { describe, expect, it } from 'vitest';

import { adminShowSearchFilterDefinitions } from '../adminShowSearchFilterDefinitions';
import { showSearchFilterDefinitions } from '../showSearchFilterDefinitions';
import { showSortOptions } from '../showSortOptions';

/**
 * Finds the values that occur more than once.
 * @param values - The values.
 * @returns The repeated ones.
 */
const getRepeated = (values: string[]): string[] => values.filter((value, index) => values.indexOf(value) !== index);

describe('show search lists', () => {
  it.each([
    ['showSearchFilterDefinitions', showSearchFilterDefinitions],
    ['adminShowSearchFilterDefinitions', adminShowSearchFilterDefinitions],
  ])('%s gives every filter its own key and URL param', (_name, definitions) => {
    // Two filters on one param would overwrite each other in the URL.
    expect(getRepeated(definitions.map((definition) => definition.key))).toEqual([]);
    expect(getRepeated(definitions.map((definition) => definition.param))).toEqual([]);
  });

  it('offers every sort once', () => {
    expect(getRepeated(showSortOptions.map((option) => option.value))).toEqual([]);
  });
});
