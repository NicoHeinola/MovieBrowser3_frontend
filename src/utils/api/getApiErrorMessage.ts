import type { ApiErrorResponse } from '@/interfaces/api/responses/ApiErrorResponse';
import { isAxiosError } from 'axios';

import { ApiErrorCode } from '@/enums/api/ApiErrorCode';
import { i18n } from '@/plugins/i18n';
import { getApiErrorDetailMessage } from '@/utils/api/getApiErrorDetailMessage';
import { isKnownApiErrorCode } from '@/utils/api/isKnownApiErrorCode';

/**
 * Tells whether a response body has a code this build can translate.
 * @param data - The response body.
 * @returns True when the body carries a known code.
 */
const hasKnownCode = (data: unknown): data is ApiErrorResponse => {
  return typeof data === 'object' && data !== null && 'code' in data && isKnownApiErrorCode(data.code);
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

    // An unknown code falls through, so a 401 or 5xx still gets its own message instead of the generic one.
    if (hasKnownCode(data)) {
      return getApiErrorDetailMessage(data);
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
