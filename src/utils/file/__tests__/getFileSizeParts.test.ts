import { describe, expect, it } from 'vitest';

import { getFileSizeParts } from '../getFileSizeParts';

describe('getFileSizeParts', () => {
  it('keeps bytes whole and steps up in 1024s with one decimal', () => {
    expect(getFileSizeParts(1023, 'en-US')).toEqual({ number: '1,023', unit: 'B' });
    expect(getFileSizeParts(1.5 * 1024 ** 3, 'en-US')).toEqual({ number: '1.5', unit: 'GB' });
  });

  it('stops at the largest unit', () => {
    expect(getFileSizeParts(2048 * 1024 ** 5, 'en-US')).toEqual({ number: '2,048.0', unit: 'PB' });
  });

  it('picks the unit from another size, so a part reads in the unit of its total', () => {
    expect(getFileSizeParts(512 * 1024 ** 2, 'en-US', 2 * 1024 ** 3)).toEqual({ number: '0.5', unit: 'GB' });
  });

  it('writes the number in the given language', () => {
    expect(getFileSizeParts(1.5 * 1024 ** 3, 'fi')).toEqual({ number: '1,5', unit: 'GB' });
  });
});
