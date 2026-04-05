import { describe, expect, it, vi } from 'vitest';
import { getEnvString } from '../getEnvString';

const mockEnv = {
  VITE_TEST_STRING: 'test-value',
  VITE_TEST_EMPTY: '',
};

vi.mock('@/utils/env/getEnvString', () => ({
  getEnvString: vi.fn((key: string) => {
    const value = mockEnv[key as keyof typeof mockEnv];
    if (value === undefined || value === '') throw new Error(`Missing environment variable: ${key}`);
    return String(value);
  }),
}));

describe('getEnvString', () => {
  it('should return the string value when it exists', () => {
    expect(getEnvString('VITE_TEST_STRING')).toBe('test-value');
  });

  it('should throw an error when the variable is missing', () => {
    expect(() => getEnvString('MISSING')).toThrow('Missing environment variable: MISSING');
  });

  it('should throw an error when the variable is empty', () => {
    expect(() => getEnvString('VITE_TEST_EMPTY')).toThrow('Missing environment variable: VITE_TEST_EMPTY');
  });
});
