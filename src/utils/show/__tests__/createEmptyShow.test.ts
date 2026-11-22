import { describe, expect, it } from 'vitest';

import { ShowEntryType } from '@/enums/show/ShowEntryType';
import { createEmptyShow } from '../createEmptyShow';

describe('createEmptyShow', () => {
  it('starts with one empty primary title and one empty season', () => {
    const show = createEmptyShow();

    expect(show.id).toBeUndefined();
    expect(show.titles).toEqual([{ title: '', is_primary: true }]);
    expect(show.categories).toEqual([]);
    expect(show.entries).toEqual([{ name: 'Season 1', type: ShowEntryType.Season, sort_order: 0, episodes: [] }]);
    expect(show.outgoing_links).toEqual([]);
    expect(show.incoming_links).toEqual([]);
  });

  it('builds a new show each time, so editing one leaves the next untouched', () => {
    const first = createEmptyShow();
    first.titles?.push({ title: 'Changed', is_primary: false } as never);

    expect(createEmptyShow().titles).toHaveLength(1);
  });
});
