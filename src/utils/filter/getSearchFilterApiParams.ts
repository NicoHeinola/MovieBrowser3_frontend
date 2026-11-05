import type { ChipsFilterValue } from '@/composables/search/ChipsFilterValue';
import type { SearchFilterDefinition } from '@/composables/search/SearchFilterDefinition';
import type { SearchFilterValue } from '@/composables/search/SearchFilterValue';

import { SearchFilterType } from '@/enums/search/SearchFilterType';

/**
 * Builds the backend `filter` params of one filter.
 * @param definition - The filter.
 * @param value - The filter's value.
 * @returns The params, empty when the filter is not active.
 */
export const getSearchFilterApiParams = (
  definition: SearchFilterDefinition,
  value: SearchFilterValue,
): Record<string, string | string[]> => {
  if (definition.type === SearchFilterType.Switch) {
    return value ? definition.api : {};
  }

  const chips = value as ChipsFilterValue;

  if (typeof definition.api === 'function') {
    return definition.api(chips);
  }

  return {
    ...(chips.included.length > 0 && { [definition.api.include]: chips.included }),
    ...(chips.excluded.length > 0 && { [definition.api.exclude]: chips.excluded }),
  };
};
