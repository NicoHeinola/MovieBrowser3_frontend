import { describe, expect, it } from 'vitest';

import { chartPalette } from '@/plugins/vuetify/chartPalette';

import { getStorageSliceColor } from '../getStorageSliceColor';

const colors = {
  primary: '#111111',
  secondary: '#222222',
  'storage-free': '#333333',
  'storage-other-shows': '#444444',
};

describe('getStorageSliceColor', () => {
  it('uses theme colors for the disk parts and grouped shows', () => {
    expect(getStorageSliceColor({ kind: 'videos', bytes: 1 }, 0, colors)).toBe('#111111');
    expect(getStorageSliceColor({ kind: 'otherFiles', bytes: 1 }, 0, colors)).toBe('#222222');
    expect(getStorageSliceColor({ kind: 'free', bytes: 1 }, 0, colors)).toBe('#333333');
    expect(getStorageSliceColor({ kind: 'otherShows', bytes: 1 }, 0, colors)).toBe('#444444');
    expect(getStorageSliceColor({ kind: 'gap', bytes: 1 }, 0, colors)).toBe('transparent');
  });

  it('gives shows the palette in turn, wrapping around', () => {
    expect(getStorageSliceColor({ kind: 'show', bytes: 1 }, 1, colors)).toBe(chartPalette[1]);
    expect(getStorageSliceColor({ kind: 'show', bytes: 1 }, chartPalette.length, colors)).toBe(chartPalette[0]);
  });
});
