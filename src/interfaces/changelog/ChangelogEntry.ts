import type { ChangelogChange } from './ChangelogChange';

/** One update of the website: a release, or the next one while it is being worked on. */
export interface ChangelogEntry {
  /** Version number, such as `1.2.0`. */
  version: string;
  /** Release date as `YYYY-MM-DD`, or `null` while the version is unreleased. */
  date: string | null;
  /** What changed in this update. */
  changes: ChangelogChange[];
}
