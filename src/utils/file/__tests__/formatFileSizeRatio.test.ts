import { describe, expect, it } from 'vitest';

import { formatFileSizeRatio } from '../formatFileSizeRatio';

describe('formatFileSizeRatio', () => {
  it("writes the part in the total's unit, with the unit once", () => {
    expect(formatFileSizeRatio(512 * 1024 ** 2, 3.3 * 1024 ** 3, 'en-US')).toBe('0.5 / 3.3 GB');
  });

  it('keeps whole bytes for small totals', () => {
    expect(formatFileSizeRatio(0, 900, 'en-US')).toBe('0 / 900 B');
  });

  it('writes the numbers in the given language', () => {
    expect(formatFileSizeRatio(1.5 * 1024 ** 3, 2.5 * 1024 ** 3, 'fi')).toBe('1,5 / 2,5 GB');
  });
});
