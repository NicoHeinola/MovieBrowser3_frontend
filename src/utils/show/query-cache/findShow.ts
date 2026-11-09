import type { Show } from '@/interfaces/api/models/Show';

/**
 * Finds a show anywhere inside cached query data, whatever its shape.
 * Only objects with an `entries` list count as shows, so related-show stubs and other objects sharing the id are skipped.
 * @param data - Cached query data that may contain shows, such as a list, a paginated response or a map of lists.
 * @param showId - The id of the show to find.
 * @returns The first matching show, or undefined when none matches.
 */
export const findShow = (data: unknown, showId: number): Show | undefined => {
  if (data === null || typeof data !== 'object') {
    return undefined;
  }

  const record = data as Record<string, unknown>;

  if (record.id === showId && Array.isArray(record.entries)) {
    return record as unknown as Show;
  }

  for (const child of Object.values(record)) {
    const show = findShow(child, showId);
    if (show) {
      return show;
    }
  }

  return undefined;
};
