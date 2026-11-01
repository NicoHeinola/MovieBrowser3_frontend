/** Kind of change listed in a changelog entry. Labels live under `changelog.changeType` in i18n. */
export enum ChangelogChangeType {
  /** A new feature. */
  Added = 'added',
  /** A change to existing behavior. */
  Changed = 'changed',
  /** A bug fix. */
  Fixed = 'fixed',
  /** A removed feature. */
  Removed = 'removed',
}
