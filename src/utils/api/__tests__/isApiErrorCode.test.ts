import type { AxiosResponse } from 'axios';
import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';

import { ApiErrorCode } from '@/enums/api/ApiErrorCode';

import { isApiErrorCode } from '../isApiErrorCode';

const createError = (data: unknown): AxiosError => {
  return new AxiosError('Request failed', undefined, undefined, undefined, { status: 422, data } as AxiosResponse);
};

describe('isApiErrorCode', () => {
  it('matches the code in the response body', () => {
    const error = createError({ code: ApiErrorCode.NoVideoFile, params: {} });

    expect(isApiErrorCode(error, ApiErrorCode.NoVideoFile)).toBe(true);
  });

  it('does not match another code', () => {
    const error = createError({ code: ApiErrorCode.Invalid, params: {} });

    expect(isApiErrorCode(error, ApiErrorCode.NoVideoFile)).toBe(false);
  });

  it('does not match an empty body or a plain error', () => {
    expect(isApiErrorCode(createError(null), ApiErrorCode.NoVideoFile)).toBe(false);
    expect(isApiErrorCode(new Error('Boom'), ApiErrorCode.NoVideoFile)).toBe(false);
  });
});
