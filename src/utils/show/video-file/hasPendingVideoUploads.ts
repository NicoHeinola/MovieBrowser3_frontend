import type { Show } from '@/interfaces/api/models/Show';

/**
 * Tells whether a show draft has picked video files that saving will upload.
 * @param show - The draft, whose episodes may carry a picked `file`.
 * @returns True when at least one episode has a file to upload.
 */
export const hasPendingVideoUploads = (show: Pick<Show, 'entries'>): boolean =>
  (show.entries ?? []).some((entry) =>
    (entry.episodes ?? []).some((episode) => Boolean((episode as { file?: File | null }).file)),
  );
