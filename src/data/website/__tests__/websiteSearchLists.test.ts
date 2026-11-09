import { describe, expect, it } from 'vitest';

import { websiteSearchFilterDefinitions } from '../websiteSearchFilterDefinitions';
import { websiteSortOptions } from '../websiteSortOptions';

/**
 * Finds the values that occur more than once.
 * @param values - The values.
 * @returns The repeated ones.
 */
const getRepeated = (values: string[]): string[] => values.filter((value, index) => values.indexOf(value) !== index);

describe('website search lists', () => {
  it.each([['websiteSearchFilterDefinitions', websiteSearchFilterDefinitions]])(
    '%s gives every filter its own key and URL param',
    (_name, definitions) => {
      // Two filters on one param would overwrite each other in the URL.
      expect(getRepeated(definitions.map((definition) => definition.key))).toEqual([]);
      expect(getRepeated(definitions.map((definition) => definition.param))).toEqual([]);
    },
  );

  it('offers every sort once', () => {
    expect(getRepeated(websiteSortOptions.map((option) => option.value))).toEqual([]);
  });
});
