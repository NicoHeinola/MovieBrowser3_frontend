import { describe, expect, it } from 'vitest';

import { ApiErrorCode } from '@/enums/api/ApiErrorCode';

import { getApiErrorDetailMessage } from '../getApiErrorDetailMessage';

describe('getApiErrorDetailMessage', () => {
  it('translates a known code with its params', () => {
    expect(getApiErrorDetailMessage({ code: ApiErrorCode.Max, params: { value: '50' } })).toBe(
      'A value is over the limit of 50.',
    );
  });

  it('reads byte counts as sizes', () => {
    expect(
      getApiErrorDetailMessage({
        code: ApiErrorCode.NotEnoughDiskSpace,
        params: { needed_bytes: '3221225472', free_bytes: '1073741824' },
      }),
    ).toBe('This needs 3.0 GB, with some space left over, but the disk has only 1.0 GB free.');
  });

  it('falls back to the generic message for an unknown code', () => {
    expect(getApiErrorDetailMessage({ code: 'from_a_newer_backend', params: {} })).toBe(
      'Something went wrong. Please try again.',
    );
  });

  it('does not treat object members as codes', () => {
    expect(getApiErrorDetailMessage({ code: 'constructor', params: {} })).toBe(
      'Something went wrong. Please try again.',
    );
  });
});
