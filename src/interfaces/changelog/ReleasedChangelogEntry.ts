import type { ChangelogEntry } from './ChangelogEntry';

/** A changelog entry whose version has been released, so it has a release date. */
export interface ReleasedChangelogEntry extends ChangelogEntry {
  /** Release date as `YYYY-MM-DD`. */
  date: string;
}
