import type { ChangelogChange } from './ChangelogChange';

/** One released update of the website. */
export interface ChangelogEntry {
  /** Version number, such as `1.2.0`. */
  version: string;
  /** Release date as `YYYY-MM-DD`. */
  date: string;
  /** What changed in this update. */
  changes: ChangelogChange[];
}
