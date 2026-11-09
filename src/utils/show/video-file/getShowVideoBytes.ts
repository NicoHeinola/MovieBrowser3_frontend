import type { Show } from '@/interfaces/api/models/Show';

import { getEntryVideoBytes } from './getEntryVideoBytes';

/**
 * Adds up the measured video files of every episode in a show.
 * @param show - The show, with its entries and their episodes loaded.
 * @returns The total in bytes; 0 when the entries are not loaded.
 */
export const getShowVideoBytes = (show: Pick<Show, 'entries'>): number =>
  (show.entries ?? []).reduce((sum, entry) => sum + getEntryVideoBytes(entry), 0);
