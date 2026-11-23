import type { ApiErrorDetail } from '@/interfaces/api/responses/ApiErrorDetail';

import { i18n } from '@/plugins/i18n';
import { isKnownApiErrorCode } from '@/utils/api/isKnownApiErrorCode';
import { formatFileSize } from '@/utils/file/formatFileSize';

/**
 * Translates an API error code with its params: the one place every code becomes a message, whether it came in a
 * failed response or inside a payload, such as why a background run failed. Params named `*_bytes` arrive as plain
 * byte counts and read as sizes in the app's language, such as `1.5 GB`.
 * @param detail - The error's code and params.
 * @returns The message in the app's language, or the generic one for a code this build has no message for.
 */
export const getApiErrorDetailMessage = (detail: ApiErrorDetail): string => {
  const { t, locale } = i18n.global;

  if (!isKnownApiErrorCode(detail.code)) {
    return t('apiErrors.generic');
  }

  const params = Object.fromEntries(
    Object.entries(detail.params).map(([key, value]) => [
      key,
      key.endsWith('_bytes') ? formatFileSize(Number(value), locale.value) : value,
    ]),
  );

  return t(`apiErrors.codes.${detail.code}`, params);
};
