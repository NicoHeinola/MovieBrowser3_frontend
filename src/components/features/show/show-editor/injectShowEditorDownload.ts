import type { ShowEditorDownload } from './ShowEditorDownload';
import type { ComputedRef } from 'vue';
import { computed, inject } from 'vue';

import { showEditorDownloadKey } from './showEditorDownloadKey';

/**
 * Reads the torrent `ShowEditor` attached. A part used outside the editor, such as in a test, has none.
 * @returns The torrent and its files still free to pick.
 */
export const injectShowEditorDownload = (): ComputedRef<ShowEditorDownload> =>
  inject(
    showEditorDownloadKey,
    computed<ShowEditorDownload>(() => ({ download: null, availableFiles: [] })),
  );
