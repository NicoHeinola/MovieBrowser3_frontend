import { afterEach, describe, expect, it, vi } from 'vitest';

import { getEnvString } from '../getEnvString';

describe('getEnvString', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns the value when it exists', () => {
    vi.stubEnv('VITE_TEST_STRING', 'test-value');

    expect(getEnvString('VITE_TEST_STRING')).toBe('test-value');
    expect(getEnvString('VITE_TEST_STRING', 'fallback')).toBe('test-value');
  });

  it('throws when a required variable is missing', () => {
    expect(() => getEnvString('VITE_TEST_MISSING')).toThrow('Missing environment variable: VITE_TEST_MISSING');
  });

  it('throws when a required variable is empty', () => {
    vi.stubEnv('VITE_TEST_EMPTY', '');

    expect(() => getEnvString('VITE_TEST_EMPTY')).toThrow('Missing environment variable: VITE_TEST_EMPTY');
  });

  it('returns the fallback for a missing or empty optional variable', () => {
    vi.stubEnv('VITE_TEST_EMPTY', '');

    expect(getEnvString('VITE_TEST_MISSING', '')).toBe('');
    expect(getEnvString('VITE_TEST_EMPTY', 'fallback')).toBe('fallback');
  });
});
