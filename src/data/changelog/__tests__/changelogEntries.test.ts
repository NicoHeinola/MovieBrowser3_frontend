import { describe, expect, it } from 'vitest';

import packageJson from '../../../../package.json';
import { changelogEntries } from '../changelogEntries';

describe('changelogEntries', () => {
  it('starts with the version in package.json', () => {
    expect(changelogEntries[0]?.version).toBe(packageJson.version);
  });

  it('has unique versions', () => {
    const versions = changelogEntries.map((entry) => entry.version);

    expect(new Set(versions).size).toBe(versions.length);
  });

  it('uses YYYY-MM-DD dates', () => {
    for (const entry of changelogEntries) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('lists the newest entry first', () => {
    const dates = changelogEntries.map((entry) => entry.date);

    expect(dates).toEqual(dates.toSorted().toReversed());
  });

  it('lists at least one change per entry', () => {
    for (const entry of changelogEntries) {
      expect(entry.changes.length).toBeGreaterThan(0);
    }
  });
});
