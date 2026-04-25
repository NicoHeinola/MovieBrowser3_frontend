import { describe, expect, it } from 'vitest';

import { getPrimaryTitle } from '../getPrimaryTitle';

const createTitle = (title: string, is_primary: boolean) => ({
  title,
  is_primary,
});

const createSource = (titles: { title: string; is_primary?: boolean }[]) => ({
  titles,
});

describe('getPrimaryTitle', () => {
  it('returns the primary title when one exists', () => {
    const source = createSource([createTitle('Fallback Title', false), createTitle('Primary Title', true)]);

    expect(getPrimaryTitle(source)).toBe('Primary Title');
  });

  it('falls back to the first title when no primary title exists', () => {
    const source = createSource([createTitle('First Title', false), createTitle('Second Title', false)]);

    expect(getPrimaryTitle(source)).toBe('First Title');
  });

  it('falls back to the provided label when the source is missing or has no titles', () => {
    expect(getPrimaryTitle(null, 'Selected source')).toBe('Selected source');
    expect(getPrimaryTitle(createSource([]), 'Selected source')).toBe('Selected source');
  });
});
