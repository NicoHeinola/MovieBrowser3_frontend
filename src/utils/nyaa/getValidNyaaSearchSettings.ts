import type { NyaaSearchSettings } from '@/interfaces/nyaa/NyaaSearchSettings';

import { nyaaCategories } from '@/data/nyaa/nyaaCategories';
import { nyaaMirrors } from '@/data/nyaa/nyaaMirrors';
import { nyaaSortOptions } from '@/data/nyaa/nyaaSortOptions';
import { nyaaTrustFilters } from '@/data/nyaa/nyaaTrustFilters';

/**
 * Picks a stored value when it is one of the allowed ones.
 * @param value - The stored value, of any shape.
 * @param allowed - The values the app still offers.
 * @param fallback - The value to use otherwise.
 * @returns The stored value or the fallback.
 */
const pick = (value: unknown, allowed: string[], fallback: string): string =>
  typeof value === 'string' && allowed.includes(value) ? value : fallback;

/**
 * Reads the nyaa settings this browser stored, field by field. A field that is missing (stored before it existed),
 * of another shape or no longer offered (a removed mirror, sort or category) gets its default, so a stale value never
 * reaches nyaa or shows up with nothing picked.
 * @param stored - What localStorage held, parsed.
 * @param defaults - The settings a new browser starts with.
 * @returns Settings with only values the app offers.
 */
export const getValidNyaaSearchSettings = (stored: unknown, defaults: NyaaSearchSettings): NyaaSearchSettings => {
  // Anything that isn't an object reads as an empty one, so every field below falls back
  const asRecord = (value: unknown): Partial<Record<string, unknown>> =>
    typeof value === 'object' && value !== null ? (value as Partial<Record<string, unknown>>) : {};
  const settings = asRecord(stored);
  const filters = asRecord(settings.filters);

  return {
    mirror: pick(
      settings.mirror,
      nyaaMirrors.map((mirror) => mirror.host),
      defaults.mirror,
    ),
    sort: pick(
      settings.sort,
      nyaaSortOptions.map((option) => option.value),
      defaults.sort,
    ),
    filters: {
      category: pick(
        filters.category,
        nyaaCategories.map((category) => category.value),
        defaults.filters.category,
      ),
      trust: pick(
        filters.trust,
        nyaaTrustFilters.map((filter) => filter.value),
        defaults.filters.trust,
      ),
    },
  };
};
