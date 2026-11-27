import { describe, expect, it } from 'vitest';

import { ApiErrorCode } from '@/enums/api/ApiErrorCode';

import { isKnownApiErrorCode } from '../isKnownApiErrorCode';

describe('isKnownApiErrorCode', () => {
  it('knows the codes in ApiErrorCode', () => {
    expect(isKnownApiErrorCode(ApiErrorCode.VideoBaseFolderMoveRunning)).toBe(true);
  });

  it('does not know new codes, object members or non-strings', () => {
    expect(isKnownApiErrorCode('from_a_newer_backend')).toBe(false);
    expect(isKnownApiErrorCode('constructor')).toBe(false);
    expect(isKnownApiErrorCode(undefined)).toBe(false);
  });
});
