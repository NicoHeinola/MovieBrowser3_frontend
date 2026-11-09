import type { ShowWatchProgress } from '@/interfaces/api/models/ShowWatchProgress';

import { updateCachedObjects } from '@/utils/query/updateCachedObjects';

/**
 * Rewrites the watch progress of one show anywhere inside cached query data, whatever its shape.
 * Only objects along the changed path are copied, so untouched shows keep their references.
 * @param data - Cached query data that may contain shows, such as a list, a paginated response or a map of lists.
 * @param watchProgress - The new watch progress; its `show_id` selects the show.
 * @returns The updated data, or the same reference when no show matched.
 */
export const setShowWatchProgress = <T>(data: T, watchProgress: ShowWatchProgress): T =>
  updateCachedObjects(data, (record) =>
    record.id === watchProgress.show_id && Array.isArray(record.entries)
      ? { ...record, watch_progress: watchProgress }
      : record,
  );
