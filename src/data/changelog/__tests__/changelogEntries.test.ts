import type { ChangelogEntry } from '@/interfaces/changelog/ChangelogEntry';
import { describe, expect, it } from 'vitest';

import { ChangelogChangeType } from '@/enums/changelog/ChangelogChangeType';

import packageJson from '../../../../package.json';
import { changelogEntries } from '../changelogEntries';

/** How far a version moved from the one before it. */
type VersionStep = 'major' | 'minor' | 'patch';

/**
 * Splits a `MAJOR.MINOR.PATCH` version into numbers.
 * @param version - The version to split.
 * @returns The three version parts.
 */
const parseVersion = (version: string): [number, number, number] => {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number);

  return [major, minor, patch];
};

/**
 * Names the single step from one version to the next, so a release never skips versions.
 * @param previous - The older version.
 * @param next - The newer version.
 * @returns The step, or `null` when `next` is not exactly one patch, minor or major step above `previous`.
 */
const getVersionStep = (previous: string, next: string): VersionStep | null => {
  const [major, minor, patch] = parseVersion(previous);
  const nextVersion = parseVersion(next).join('.');

  if (nextVersion === `${major}.${minor}.${patch + 1}`) {
    return 'patch';
  }

  if (nextVersion === `${major}.${minor + 1}.0`) {
    return 'minor';
  }

  if (nextVersion === `${major + 1}.0.0`) {
    return 'major';
  }

  return null;
};

/**
 * Pairs each entry with the older entry below it.
 * @returns `[newer, older]` pairs, newest first.
 */
const getEntryPairs = (): [ChangelogEntry, ChangelogEntry][] =>
  changelogEntries.slice(0, -1).map((entry, index) => [entry, changelogEntries[index + 1]!]);

describe('changelogEntries', () => {
  it('starts with the version in package.json', () => {
    expect(changelogEntries[0]?.version).toBe(packageJson.version);
  });

  it('starts the history at 1.0.0', () => {
    expect(changelogEntries.at(-1)?.version).toBe('1.0.0');
  });

  it('has unique versions', () => {
    const versions = changelogEntries.map((entry) => entry.version);

    expect(new Set(versions).size).toBe(versions.length);
  });

  it('moves each version exactly one patch, minor or major step', () => {
    for (const [newer, older] of getEntryPairs()) {
      expect(getVersionStep(older.version, newer.version), `${older.version} -> ${newer.version}`).not.toBeNull();
    }
  });

  it('makes a version with new features at least a minor step', () => {
    for (const [newer, older] of getEntryPairs()) {
      const hasFeature = newer.changes.some((change) => change.type === ChangelogChangeType.Added);

      if (hasFeature) {
        expect(getVersionStep(older.version, newer.version), newer.version).not.toBe('patch');
      }
    }
  });

  it('leaves only the newest entry unreleased', () => {
    for (const entry of changelogEntries.slice(1)) {
      expect(entry.date, entry.version).not.toBeNull();
    }
  });

  it('uses YYYY-MM-DD dates', () => {
    for (const entry of changelogEntries) {
      if (entry.date !== null) {
        expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it('lists the newest release first', () => {
    const dates = changelogEntries.flatMap((entry) => (entry.date === null ? [] : [entry.date]));

    expect(dates).toEqual(dates.toSorted().toReversed());
  });

  it('lists at least one change per release', () => {
    for (const entry of changelogEntries) {
      if (entry.date !== null) {
        expect(entry.changes.length, entry.version).toBeGreaterThan(0);
      }
    }
  });
});
