/** The frontend's newest GitHub release. The running frontend version is `__APP_VERSION__`. */
export interface AppVersionFrontend {
  /** The newest released version, or `null` when GitHub could not be reached. */
  latest: string | null;
  /** The newest release's GitHub page, or `null` when GitHub could not be reached. */
  release_url: string | null;
}
