import { describe, expect, it, vi } from 'vitest';
import { getEnvArray } from '../getEnvArray';

const mockEnv = {
  VITE_TEST_ARRAY: ' a, b , c ',
  VITE_CUSTOM_SEP: 'one|two|three',
  VITE_EMPTY_ITEMS: 'a,,b',
};

vi.mock('@/utils/env/getEnvArray', () => ({
  getEnvArray: vi.fn((key: string, separator = ',') => {
    const value = mockEnv[key as keyof typeof mockEnv];
    if (value === undefined || value === '') throw new Error(`Missing environment variable: ${key}`);
    return String(value)
      .split(separator)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }),
}));

describe('getEnvArray', () => {
  it('should return a trimmed array of strings', () => {
    expect(getEnvArray('VITE_TEST_ARRAY')).toEqual(['a', 'b', 'c']);
  });

  it('should support custom separators', () => {
    expect(getEnvArray('VITE_CUSTOM_SEP', '|')).toEqual(['one', 'two', 'three']);
  });

  it('should filter out empty strings', () => {
    expect(getEnvArray('VITE_EMPTY_ITEMS')).toEqual(['a', 'b']);
  });

  it('should throw an error when the variable is missing', () => {
    expect(() => getEnvArray('MISSING')).toThrow('Missing environment variable: MISSING');
  });
});
