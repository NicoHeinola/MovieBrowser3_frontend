import type { ChangelogEntry } from '@/interfaces/changelog/ChangelogEntry';
import type { ReleasedChangelogEntry } from '@/interfaces/changelog/ReleasedChangelogEntry';

/**
 * Drops the unreleased entry, so users only see versions that have shipped.
 * @param entries - Every changelog entry, newest first.
 * @returns The released entries, newest first.
 */
export const getReleasedChangelogEntries = (entries: ChangelogEntry[]): ReleasedChangelogEntry[] =>
  entries.filter((entry): entry is ReleasedChangelogEntry => entry.date !== null);
