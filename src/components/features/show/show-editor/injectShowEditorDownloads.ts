import type { ShowEditorDownloads } from './ShowEditorDownloads';
import type { ComputedRef } from 'vue';
import { computed, inject } from 'vue';

import { showEditorDownloadsKey } from './showEditorDownloadsKey';

/**
 * Reads the torrents `ShowEditor` follows. A part used outside the editor, such as in a test, has none.
 * @returns The torrents, and those with files to pick.
 */
export const injectShowEditorDownloads = (): ComputedRef<ShowEditorDownloads> =>
  inject(
    showEditorDownloadsKey,
    computed<ShowEditorDownloads>(() => ({ torrents: [], pickable: [] })),
  );
