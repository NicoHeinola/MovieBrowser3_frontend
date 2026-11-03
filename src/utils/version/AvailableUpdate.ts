/** A newer release than the one running, built from the backend's app-version check. */
export interface AvailableUpdate {
  /** The highest newer version across the backend and the frontend. */
  version: string;
  /** The backend's newest release page, or `null` when the backend is current or the link is unknown. */
  backendReleaseUrl: string | null;
  /** The frontend's newest release page, or `null` when the frontend is current or the link is unknown. */
  frontendReleaseUrl: string | null;
}
