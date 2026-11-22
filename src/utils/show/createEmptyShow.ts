import type { Show } from '@/interfaces/api/models/Show';

import { ShowEntryType } from '@/enums/show/ShowEntryType';

/**
 * Builds the show a new show starts from: one empty primary title and one season. Season names are saved as typed,
 * and the editor names the seasons it adds in English, so this one is English too.
 * @returns The new show.
 */
export const createEmptyShow = (): Show =>
  ({
    titles: [{ title: '', is_primary: true }],
    categories: [],
    entries: [{ name: 'Season 1', type: ShowEntryType.Season, sort_order: 0, episodes: [] }],
    outgoing_links: [],
    incoming_links: [],
  }) as unknown as Show;
