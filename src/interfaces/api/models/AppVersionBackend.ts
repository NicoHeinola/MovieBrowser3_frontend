/** The backend's running version and its newest GitHub release. */
export interface AppVersionBackend {
  /** The running backend version, bare semver such as `1.1.0`. */
  current: string;
  /** The newest released version, or `null` when GitHub could not be reached. */
  latest: string | null;
  /** The newest release's GitHub page, or `null` when GitHub could not be reached. */
  release_url: string | null;
}
