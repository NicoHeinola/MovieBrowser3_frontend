import { describe, it, expect, vi } from 'vitest';
import { getEnvNumber } from '../getEnvNumber';

const mockEnv = {
  VITE_TEST_NUMBER: '123',
  VITE_TEST_INVALID_NUMBER: 'not-a-number',
};

vi.mock('@/utils/env/getEnvNumber', () => ({
  getEnvNumber: vi.fn((key: string) => {
    const value = mockEnv[key as keyof typeof mockEnv];
    if (value === undefined || value === '') throw new Error(`Missing environment variable: ${key}`);
    const parsed = Number(value);
    if (Number.isNaN(parsed)) throw new TypeError(`Environment variable ${key} is not a valid number: "${value}"`);
    return parsed;
  }),
}));

describe('getEnvNumber', () => {
  it('should return the numeric value when it is valid', () => {
    expect(getEnvNumber('VITE_TEST_NUMBER')).toBe(123);
  });

  it('should throw a TypeError when the value is not a number', () => {
    expect(() => getEnvNumber('VITE_TEST_INVALID_NUMBER')).toThrow(/not a valid number/);
  });

  it('should throw an error when the variable is missing', () => {
    expect(() => getEnvNumber('MISSING')).toThrow('Missing environment variable: MISSING');
  });
});
