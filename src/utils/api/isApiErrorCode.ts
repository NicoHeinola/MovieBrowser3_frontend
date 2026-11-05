import type { ApiErrorCode } from '@/enums/api/ApiErrorCode';
import type { ApiErrorResponse } from '@/interfaces/api/responses/ApiErrorResponse';
import { isAxiosError } from 'axios';

/**
 * Tells whether a failed request carries a specific API error code.
 * @param error - The thrown error.
 * @param code - The code to look for.
 * @returns True when the response body has that code.
 */
export const isApiErrorCode = (error: unknown, code: ApiErrorCode): boolean => {
  return isAxiosError<ApiErrorResponse>(error) && error.response?.data?.code === code;
};
