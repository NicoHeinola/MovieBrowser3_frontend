import { describe, expect, it } from 'vitest';

import { compareVersions } from '../compareVersions';

describe('compareVersions', () => {
  it.each([
    ['1.2.0', '1.1.0'],
    ['1.10.0', '1.9.0'],
    ['2.0.0', '1.99.99'],
    ['1.0.1', '1.0.0'],
  ])('%s is newer than %s', (newer, older) => {
    expect(compareVersions(newer, older)).toBeGreaterThan(0);
    expect(compareVersions(older, newer)).toBeLessThan(0);
  });

  it.each([
    ['1.2.0', '1.2.0'],
    ['v1.2.0', '1.2.0'],
    ['1.2', '1.2.0'],
  ])('%s equals %s', (a, b) => {
    expect(compareVersions(a, b)).toBe(0);
  });
});
