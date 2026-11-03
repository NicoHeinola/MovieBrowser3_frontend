import type { AppVersionBackend } from './AppVersionBackend';
import type { AppVersionFrontend } from './AppVersionFrontend';

/** Running and newest released versions of both halves of the app. */
export interface AppVersion {
  backend: AppVersionBackend;
  frontend: AppVersionFrontend;
  /** When the backend last asked GitHub, or `null` when it never got an answer. */
  checked_at: string | null;
}
