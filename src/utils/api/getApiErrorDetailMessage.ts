import type { ApiErrorDetail } from '@/interfaces/api/responses/ApiErrorDetail';

import { i18n } from '@/plugins/i18n';
import { isKnownApiErrorCode } from '@/utils/api/isKnownApiErrorCode';

/**
 * Translates an API error code with its params: the one place every code becomes a message, whether it came in a
 * failed response or inside a payload, such as why a background run failed.
 * @param detail - The error's code and params.
 * @returns The message in the app's language, or the generic one for a code this build has no message for.
 */
export const getApiErrorDetailMessage = (detail: ApiErrorDetail): string => {
  const { t } = i18n.global;

  return isKnownApiErrorCode(detail.code) ? t(`apiErrors.codes.${detail.code}`, detail.params) : t('apiErrors.generic');
};
