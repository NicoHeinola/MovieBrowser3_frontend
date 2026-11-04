import type { SetupCheckCode } from '@/enums/setup/SetupCheckCode';

export interface SetupCheckResult {
  ok: boolean;
  /** Why the check failed, as a code the frontend translates; `null` when it passed. */
  code: SetupCheckCode | null;
  /** Values for the code's message, such as the path that failed. */
  params: Record<string, string>;
}
