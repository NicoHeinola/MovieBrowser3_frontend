import type { ApiErrorResponse } from '@/interfaces/api/responses/ApiErrorResponse';
import { isAxiosError } from 'axios';

import { ApiErrorCode } from '@/enums/api/ApiErrorCode';
import { i18n } from '@/plugins/i18n';

/** Every code that has a message. A Set, so a body's `code` can't match inherited members such as `constructor`. */
const knownCodes = new Set<string>(Object.values(ApiErrorCode));

/**
 * Tells whether a response body has a code this build can translate.
 * @param data - The response body.
 * @returns True when the body carries a known code.
 */
const hasKnownCode = (data: unknown): data is ApiErrorResponse => {
  return typeof data === 'object' && data !== null && 'code' in data && knownCodes.has(data.code as string);
};

/**
 * Turns a failed request into a message in the app's language.
 * @param error - The thrown error.
 * @returns The message to show the user.
 */
export const getApiErrorMessage = (error: unknown): string => {
  const { t } = i18n.global;

  if (isAxiosError(error)) {
    const data: unknown = error.response?.data;
    const status: number = error.response?.status ?? 0;

    if (hasKnownCode(data)) {
      return t(`apiErrors.codes.${data.code}`, data.params);
    }

    // Responses without a known code (Laravel's 404, 429 and 500) only have English text, so never show their `message`.
    if (status === 401) {
      return t(`apiErrors.codes.${ApiErrorCode.Unauthenticated}`);
    }

    if (status >= 500) {
      return t('apiErrors.server');
    }

    return t('apiErrors.generic');
  }

  if (error instanceof Error && error.message !== '') {
    return error.message;
  }

  return t('apiErrors.generic');
};
