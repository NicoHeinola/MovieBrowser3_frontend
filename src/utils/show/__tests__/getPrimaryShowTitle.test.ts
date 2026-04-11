import type { Show } from '@/interfaces/api/models/Show';
import { describe, expect, it } from 'vitest';

import { getPrimaryShowTitle } from '../getPrimaryShowTitle';

const createShow = (titles: Show['titles']): Pick<Show, 'titles'> => ({
  titles,
});

describe('getPrimaryShowTitle', () => {
  it('returns the primary title when one exists', () => {
    const show = createShow([
      { title: 'Fallback Title', is_primary: false },
      { title: 'Primary Title', is_primary: true },
    ]);

    expect(getPrimaryShowTitle(show)).toBe('Primary Title');
  });

  it('falls back to the first title when no primary title exists', () => {
    const show = createShow([
      { title: 'First Title', is_primary: false },
      { title: 'Second Title', is_primary: false },
    ]);

    expect(getPrimaryShowTitle(show)).toBe('First Title');
  });

  it('falls back to the provided label when the show is missing or has no titles', () => {
    expect(getPrimaryShowTitle(null, 'Selected show')).toBe('Selected show');
    expect(getPrimaryShowTitle(createShow([]), 'Selected show')).toBe('Selected show');
  });
});
