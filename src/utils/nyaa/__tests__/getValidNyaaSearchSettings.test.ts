import type { NyaaSearchSettings } from '@/interfaces/nyaa/NyaaSearchSettings';

import { describe, expect, it } from 'vitest';

import { getValidNyaaSearchSettings } from '../getValidNyaaSearchSettings';

const defaults: NyaaSearchSettings = { mirror: 'nyaa.si', sort: '-size', filters: { category: '1_2', trust: '0' } };

describe('getValidNyaaSearchSettings', () => {
  it('keeps stored values the app still offers', () => {
    const stored = { mirror: 'nyaa.land', sort: 'id', filters: { category: '4_0', trust: '2' } };

    expect(getValidNyaaSearchSettings(stored, defaults)).toEqual(stored);
  });

  it('gives each missing field its default, nested filters too', () => {
    expect(getValidNyaaSearchSettings({ mirror: 'nyaa.land', filters: { category: '0_0' } }, defaults)).toEqual({
      mirror: 'nyaa.land',
      sort: '-size',
      filters: { category: '0_0', trust: '0' },
    });
  });

  it('replaces values that are no longer offered or have another shape', () => {
    const stored = { mirror: 'nyaa.gone', sort: '-title', filters: { category: '9_9', trust: 2 } };

    expect(getValidNyaaSearchSettings(stored, defaults)).toEqual(defaults);
  });

  it('starts over from the defaults for something that is not settings at all', () => {
    expect(getValidNyaaSearchSettings('broken', defaults)).toEqual(defaults);
    expect(getValidNyaaSearchSettings(null, defaults)).toEqual(defaults);
    expect(getValidNyaaSearchSettings({ filters: 'broken' }, defaults)).toEqual(defaults);
  });
});
