import type { ShowWatchProgress } from '@/interfaces/api/models/ShowWatchProgress';

/**
 * Rewrites the watch progress of one show anywhere inside cached query data, whatever its shape.
 * Only objects along the changed path are copied, so untouched shows keep their references.
 * @param data - Cached query data that may contain shows, such as a list, a paginated response or a map of lists.
 * @param watchProgress - The new watch progress; its `show_id` selects the show.
 * @returns The updated data, or the same reference when no show matched.
 */
export const setShowWatchProgress = <T>(data: T, watchProgress: ShowWatchProgress): T => {
  const patch = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      const items = value.map((item) => patch(item));
      return items.some((patched, index) => patched !== value[index]) ? items : value;
    }

    if (value === null || typeof value !== 'object') {
      return value;
    }

    const record = value as Record<string, unknown>;

    if (record.id === watchProgress.show_id && Array.isArray(record.entries)) {
      return { ...record, watch_progress: watchProgress };
    }

    let result = record;
    for (const [key, child] of Object.entries(record)) {
      const patched = patch(child);
      if (patched !== child) {
        result = result === record ? { ...record } : result;
        result[key] = patched;
      }
    }
    return result;
  };

  return patch(data) as T;
};
