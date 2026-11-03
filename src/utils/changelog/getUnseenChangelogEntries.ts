import type { ReleasedChangelogEntry } from '@/interfaces/changelog/ReleasedChangelogEntry';

/**
 * Picks the changelog entries released after the version the user last saw.
 * @param entries - Every changelog entry, newest first.
 * @param lastSeenVersion - The newest version the user has seen, or `null` when they have seen none.
 * @returns The unseen entries, newest first.
 */
export const getUnseenChangelogEntries = (
  entries: ReleasedChangelogEntry[],
  lastSeenVersion: string | null,
): ReleasedChangelogEntry[] => {
  const lastSeenIndex = entries.findIndex((entry) => entry.version === lastSeenVersion);

  // First visit, or the seen version is no longer listed: show only the latest update instead of the whole history.
  if (lastSeenIndex === -1) {
    return entries.slice(0, 1);
  }

  return entries.slice(0, lastSeenIndex);
};
