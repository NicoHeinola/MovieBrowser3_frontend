import type { Show } from '@/interfaces/api/models/Show';
import { describe, expect, it } from 'vitest';

import { getPrimaryShowTitle } from '../getPrimaryShowTitle';

let nextTitleId = 1;

const createTitle = (title: string, is_primary: boolean) => ({
  id: nextTitleId++,
  show_id: 1,
  title,
  is_primary,
  created_at: '2026-04-19T00:00:00Z',
  updated_at: '2026-04-19T00:00:00Z',
});

const createShow = (titles: Show['titles']): Pick<Show, 'titles'> => ({
  titles,
});

describe('getPrimaryShowTitle', () => {
  it('returns the primary title when one exists', () => {
    const show = createShow([createTitle('Fallback Title', false), createTitle('Primary Title', true)]);

    expect(getPrimaryShowTitle(show)).toBe('Primary Title');
  });

  it('falls back to the first title when no primary title exists', () => {
    const show = createShow([createTitle('First Title', false), createTitle('Second Title', false)]);

    expect(getPrimaryShowTitle(show)).toBe('First Title');
  });

  it('falls back to the provided label when the show is missing or has no titles', () => {
    expect(getPrimaryShowTitle(null, 'Selected show')).toBe('Selected show');
    expect(getPrimaryShowTitle(createShow([]), 'Selected show')).toBe('Selected show');
  });
});
