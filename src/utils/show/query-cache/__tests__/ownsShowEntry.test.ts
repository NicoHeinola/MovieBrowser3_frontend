import { describe, expect, it } from 'vitest';

import { ownsShowEntry } from '../ownsShowEntry';

describe('ownsShowEntry', () => {
  const show = { id: 1, entries: [{ id: 10, show_id: 1 }] };

  it('matches the show that lists the entry', () => {
    expect(ownsShowEntry(show, 1, 10)).toBe(true);
  });

  it('rejects other entries, other shows and objects without entries', () => {
    expect(ownsShowEntry(show, 1, 11)).toBe(false);
    expect(ownsShowEntry(show, 2, 10)).toBe(false);
    expect(ownsShowEntry({ id: 1, name: 'category' }, 1, 10)).toBe(false);
  });

  it('rejects an entry that belongs to another show', () => {
    expect(ownsShowEntry({ id: 1, entries: [{ id: 10, show_id: 2 }] }, 1, 10)).toBe(false);
  });
});
