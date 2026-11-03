import type { ChangelogDialogProps } from '@/components/features/changelog/changelog-dialog';

import { useStorage } from '@vueuse/core';
import { useRoute } from 'vue-router';

import { ChangelogDialog } from '@/components/features/changelog/changelog-dialog';
import { useDialog } from '@/components/layouts/dialog-provider';
import { changelogEntries } from '@/data/changelog/changelogEntries';
import { getReleasedChangelogEntries } from '@/utils/changelog/getReleasedChangelogEntries';
import { getUnseenChangelogEntries } from '@/utils/changelog/getUnseenChangelogEntries';

/** Most updates the dialog lists at once; "All updates" covers the rest. */
const MAX_SHOWN_ENTRIES = 3;

/**
 * Shows the "What's new" dialog for updates released since the user's last visit in this browser.
 * A first visit only records the latest release, so new users are not greeted with a changelog.
 * @returns `showUnseenChanges`.
 */
export const useChangelogNotice = () => {
  /** The newest changelog version this browser has shown. */
  const lastSeenVersion = useStorage<string | null>('changelog.lastSeenVersion', null);

  const route = useRoute();
  const dialog = useDialog();

  /**
   * Opens the dialog when there are unseen updates and marks them as seen.
   * @returns Nothing.
   */
  const showUnseenChanges = async (): Promise<void> => {
    const releasedEntries = getReleasedChangelogEntries(changelogEntries);

    // First visit in this browser: nothing is "new" to someone who just arrived, so remember the latest release
    // without the dialog. Later releases still show it.
    if (lastSeenVersion.value === null) {
      lastSeenVersion.value = releasedEntries[0]?.version ?? null;

      return;
    }

    const entries = getUnseenChangelogEntries(releasedEntries, lastSeenVersion.value);
    const latestEntry = entries[0];

    if (latestEntry === undefined) {
      return;
    }

    // Mark as seen before opening, so a reload while the dialog is open doesn't show it again.
    lastSeenVersion.value = latestEntry.version;

    // The changelog page already lists every update, so the dialog would only cover it.
    if (route.name === 'authenticated-changelog') {
      return;
    }

    await dialog.showDialog<void, Omit<ChangelogDialogProps, 'close' | 'modelValue'>>({
      component: ChangelogDialog,
      props: { entries: entries.slice(0, MAX_SHOWN_ENTRIES) },
    });
  };

  return {
    showUnseenChanges,
  };
};
