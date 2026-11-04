import type { ChangelogEntry } from '@/interfaces/changelog/ChangelogEntry';

/**
 * Picks the entries the changelog page lists: every released version, plus the unreleased one once it has lines.
 * @param entries - Every changelog entry, newest first.
 * @returns The entries to list, newest first.
 */
export const getVisibleChangelogEntries = (entries: ChangelogEntry[]): ChangelogEntry[] =>
  // Right after a release the next version's entry is still empty, so there is nothing to announce yet.
  entries.filter((entry) => entry.date !== null || entry.changes.length > 0);
