export interface SetupCheckResult {
  ok: boolean;
  /** Why the check failed, written for the user; `null` when it passed. */
  message: string | null;
}
