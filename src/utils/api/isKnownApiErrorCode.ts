import { ApiErrorCode } from '@/enums/api/ApiErrorCode';

/** Every code this build has a message for. A Set, so a code can't match inherited members such as `constructor`. */
const knownCodes = new Set<string>(Object.values(ApiErrorCode));

/**
 * Tells whether this build can translate an API error code. A newer backend can send codes it doesn't know yet.
 * @param code - The code from the backend.
 * @returns True when `ApiErrorCode` has it, and so `apiErrors.codes` has its message.
 */
export const isKnownApiErrorCode = (code: unknown): code is ApiErrorCode => {
  return typeof code === 'string' && knownCodes.has(code);
};
