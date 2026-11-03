import type { AvailableUpdate } from './AvailableUpdate';
import type { AppVersion } from '@/interfaces/api/models/AppVersion';

import { compareVersions } from './compareVersions';

/**
 * Picks a release's version when it is strictly newer than the running one.
 * @param latest - The newest released version, or `null` when GitHub could not be reached.
 * @param current - The running version.
 * @returns `latest` when it is newer, otherwise `null`.
 */
const getNewerVersion = (latest: string | null, current: string): string | null =>
  // `null` means GitHub couldn't be reached: "no update known", not an error. Strictly newer only, since a dev build
  // can run ahead of the newest release.
  latest !== null && compareVersions(latest, current) > 0 ? latest : null;

/**
 * Finds the update to offer, if the backend or the frontend is behind its newest release.
 * @param appVersion - The backend's app-version check.
 * @param frontendVersion - The running frontend version.
 * @returns The update, or `null` when both are current or GitHub could not be reached.
 */
export const getAvailableUpdate = (appVersion: AppVersion, frontendVersion: string): AvailableUpdate | null => {
  const backendVersion = getNewerVersion(appVersion.backend.latest, appVersion.backend.current);
  const newerFrontendVersion = getNewerVersion(appVersion.frontend.latest, frontendVersion);

  if (backendVersion === null && newerFrontendVersion === null) {
    return null;
  }

  // Both halves release together, so one version is enough; take the higher one when they differ.
  const versions = [backendVersion, newerFrontendVersion].filter((version): version is string => version !== null);
  const version = versions.reduce((highest, candidate) =>
    compareVersions(candidate, highest) > 0 ? candidate : highest,
  );

  return {
    version,
    backendReleaseUrl: backendVersion === null ? null : appVersion.backend.release_url,
    frontendReleaseUrl: newerFrontendVersion === null ? null : appVersion.frontend.release_url,
  };
};
