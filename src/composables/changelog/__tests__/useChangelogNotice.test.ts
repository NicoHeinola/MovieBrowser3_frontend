import type { ChangelogEntry } from '@/interfaces/changelog/ChangelogEntry';
import type { EffectScope } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';

import { useChangelogNotice } from '../useChangelogNotice';

const showDialog = vi.fn();
const route: { name: string } = { name: 'authenticated-home' };

vi.mock('vue-router', () => ({
  useRoute: () => route,
}));

vi.mock('@/components/layouts/dialog-provider', () => ({
  useDialog: () => ({ showDialog }),
}));

vi.mock('@/components/features/changelog/changelog-dialog', () => ({
  ChangelogDialog: {},
}));

vi.mock('@/data/changelog/changelogEntries', () => ({
  changelogEntries: [
    // Unreleased: never shown or remembered, so every test below sees 1.4.0 as the latest update.
    { version: '1.5.0', date: null, changes: [] },
    { version: '1.4.0', date: '2026-05-01', changes: [] },
    { version: '1.3.0', date: '2026-04-01', changes: [] },
    { version: '1.2.0', date: '2026-03-01', changes: [] },
    { version: '1.1.0', date: '2026-02-01', changes: [] },
    { version: '1.0.0', date: '2026-01-01', changes: [] },
  ] satisfies ChangelogEntry[],
}));

const storageKey = 'changelog.lastSeenVersion';
const scopes: EffectScope[] = [];

/**
 * Runs the composable inside an effect scope, like a component setup would.
 * @returns The composable's public surface.
 */
const setup = () => {
  const scope = effectScope();
  scopes.push(scope);

  return scope.run(() => useChangelogNotice())!;
};

/**
 * Lists the versions passed to the dialog on one call.
 * @param call - Which `showDialog` call to read.
 * @returns The versions, newest first.
 */
const getShownVersions = (call: number): string[] =>
  showDialog.mock.calls[call]![0].props.entries.map((entry: ChangelogEntry) => entry.version);

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  route.name = 'authenticated-home';
});

afterEach(() => {
  for (const scope of scopes) {
    scope.stop();
  }

  scopes.length = 0;
});

describe('useChangelogNotice', () => {
  it('skips the dialog on a first visit and remembers the latest release', async () => {
    await setup().showUnseenChanges();

    expect(showDialog).not.toHaveBeenCalled();
    expect(localStorage.getItem(storageKey)).toBe('1.4.0');
  });

  it('shows only the latest update when the seen version is no longer listed', async () => {
    localStorage.setItem(storageKey, '0.9.0');

    await setup().showUnseenChanges();

    expect(getShownVersions(0)).toEqual(['1.4.0']);
  });

  it('shows every update newer than the last seen version', async () => {
    localStorage.setItem(storageKey, '1.2.0');

    await setup().showUnseenChanges();

    expect(getShownVersions(0)).toEqual(['1.4.0', '1.3.0']);
    expect(localStorage.getItem(storageKey)).toBe('1.4.0');
  });

  it('lists at most three updates', async () => {
    localStorage.setItem(storageKey, '1.0.0');

    await setup().showUnseenChanges();

    expect(getShownVersions(0)).toEqual(['1.4.0', '1.3.0', '1.2.0']);
  });

  it('does not open the dialog again once the latest update was seen', async () => {
    localStorage.setItem(storageKey, '1.3.0');
    const { showUnseenChanges } = setup();

    await showUnseenChanges();
    await showUnseenChanges();

    expect(showDialog).toHaveBeenCalledOnce();
  });

  it('marks updates as seen without the dialog on the changelog page', async () => {
    route.name = 'authenticated-changelog';
    localStorage.setItem(storageKey, '1.3.0');

    await setup().showUnseenChanges();

    expect(showDialog).not.toHaveBeenCalled();
    expect(localStorage.getItem(storageKey)).toBe('1.4.0');
  });
});
