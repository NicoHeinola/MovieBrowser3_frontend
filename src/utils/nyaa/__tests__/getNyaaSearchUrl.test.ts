import { describe, expect, it } from 'vitest';

import { getNyaaSearchUrl } from '../getNyaaSearchUrl';

describe('getNyaaSearchUrl', () => {
  it("builds nyaa's query, descending for a leading dash", () => {
    expect(getNyaaSearchUrl('https://nyaa.si', { q: 'tanya the evil', c: '1_2' }, '-size')).toBe(
      'https://nyaa.si/?f=0&c=1_2&q=tanya+the+evil&s=size&o=desc',
    );
  });

  it('searches everything for missing params and sorts ascending without a dash', () => {
    expect(getNyaaSearchUrl('https://nyaa.land', undefined, 'id')).toBe('https://nyaa.land/?f=0&c=0_0&q=&s=id&o=asc');
    expect(getNyaaSearchUrl('https://nyaa.land', { f: '2' }, '-seeders')).toBe(
      'https://nyaa.land/?f=2&c=0_0&q=&s=seeders&o=desc',
    );
  });
});
