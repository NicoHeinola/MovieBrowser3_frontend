import type { NyaaOption } from '@/interfaces/nyaa/NyaaOption';
import type { SortOption } from '@/interfaces/search/SortOption';

import { describe, expect, it } from 'vitest';

import { nyaaCategories } from '../nyaaCategories';
import { nyaaSortOptions } from '../nyaaSortOptions';
import { nyaaTrustFilters } from '../nyaaTrustFilters';

const values = (options: (NyaaOption | SortOption)[]): string[] => options.map((option) => option.value);

describe('nyaa search options', () => {
  it('start with English-translated anime, no trust filter and biggest first, and offer every category', () => {
    expect(nyaaCategories[0].value).toBe('1_2');
    expect(nyaaCategories.map((category) => category.value)).toContain('0_0');
    expect(nyaaTrustFilters[0].value).toBe('0');
    expect(nyaaSortOptions[0].value).toBe('-size');
  });

  it("use nyaa's own value formats without duplicates", () => {
    for (const options of [nyaaCategories, nyaaTrustFilters, nyaaSortOptions]) {
      expect(new Set(values(options)).size).toBe(options.length);
    }

    expect(values(nyaaCategories).every((value) => /^\d_\d$/.test(value))).toBe(true);
    const sortPattern = /^-?(?:id|size|seeders|leechers|downloads|comments)$/;
    expect(values(nyaaSortOptions).every((value) => sortPattern.test(value))).toBe(true);
  });
});
