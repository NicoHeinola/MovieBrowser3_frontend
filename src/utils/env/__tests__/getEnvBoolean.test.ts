import { describe, it, expect, vi } from 'vitest';
import { getEnvBoolean } from '../getEnvBoolean';

const mockEnv = {
  VITE_TEST_BOOLEAN_TRUE: 'true',
  VITE_TEST_BOOLEAN_FALSE: 'false',
  VITE_TEST_INVALID_BOOLEAN: 'not-a-boolean',
};

vi.mock('@/utils/env/getEnvBoolean', () => ({
  getEnvBoolean: vi.fn((key: string) => {
    const value = mockEnv[key as keyof typeof mockEnv];
    if (value === undefined || value === '') throw new Error(`Missing environment variable: ${key}`);
    const normalized = String(value).toLowerCase().trim();
    if (normalized !== 'true' && normalized !== 'false')
      throw new TypeError(`Environment variable ${key} must be "true" or "false", got: "${value}"`);
    return normalized === 'true';
  }),
}));

describe('getEnvBoolean', () => {
  it('should return true for "true"', () => {
    expect(getEnvBoolean('VITE_TEST_BOOLEAN_TRUE')).toBe(true);
  });

  it('should return false for "false"', () => {
    expect(getEnvBoolean('VITE_TEST_BOOLEAN_FALSE')).toBe(false);
  });

  it('should throw a TypeError when the value is not "true" or "false"', () => {
    expect(() => getEnvBoolean('VITE_TEST_INVALID_BOOLEAN')).toThrow(/must be "true" or "false"/);
  });

  it('should throw an error when the variable is missing', () => {
    expect(() => getEnvBoolean('MISSING')).toThrow('Missing environment variable: MISSING');
  });
});
