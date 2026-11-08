import { describe, expect, it } from 'vitest';

import { formatFileSize } from '../formatFileSize';

describe('formatFileSize', () => {
  it('keeps small sizes in whole bytes', () => {
    expect(formatFileSize(0, 'en-US')).toBe('0 B');
    expect(formatFileSize(1023, 'en-US')).toBe('1,023 B');
  });

  it('steps up in 1024s with one decimal', () => {
    expect(formatFileSize(1024, 'en-US')).toBe('1.0 KB');
    expect(formatFileSize(1.5 * 1024 ** 3, 'en-US')).toBe('1.5 GB');
  });

  it('stops at the largest unit', () => {
    expect(formatFileSize(2048 * 1024 ** 5, 'en-US')).toBe('2,048.0 PB');
  });

  it('writes the number in the given language', () => {
    expect(formatFileSize(1.5 * 1024 ** 3, 'fi')).toBe('1,5 GB');
  });
});
