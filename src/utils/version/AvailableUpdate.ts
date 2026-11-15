/** A newer release than the one running, built from the backend's app-version check. */
export interface AvailableUpdate {
  /**
   * The newer app version, or `null` when only the backend has an update. The frontend's version is the app version:
   * the backend numbers its releases by API changes, which users never see.
   */
  version: string | null;
  /** The backend's newest release page, or `null` when the backend is current or the link is unknown. */
  backendReleaseUrl: string | null;
  /** The frontend's newest release page, or `null` when the frontend is current or the link is unknown. */
  frontendReleaseUrl: string | null;
}
