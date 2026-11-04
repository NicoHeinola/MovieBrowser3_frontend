import type { ApiErrorDetail } from '@/interfaces/api/responses/ApiErrorDetail';

/** The body of an API error. A 422 repeats its first field error at the top level and lists all of them in `errors`. */
export interface ApiErrorResponse extends ApiErrorDetail {
  errors?: Record<string, ApiErrorDetail[]>;
}
