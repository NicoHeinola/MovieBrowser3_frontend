import { describe, expect, it } from 'vitest';

import { findShow } from '../findShow';

const createShow = (id: number) => ({ id, entries: [], watch_progress: null });

describe('findShow', () => {
  it('finds a show nested anywhere in the data', () => {
    const show = createShow(2);
    const data = { latest: [createShow(1)], random: { data: [show] } };

    expect(findShow(data, 2)).toBe(show);
  });

  it('returns undefined when no show matches', () => {
    expect(findShow([createShow(1)], 2)).toBeUndefined();
    expect(findShow(undefined, 2)).toBeUndefined();
  });

  it('skips objects with a matching id that are not shows', () => {
    const show = createShow(2);
    const data = [{ id: 1, outgoing_links: [{ id: 5, target_show: { id: 2 } }] }, show];

    expect(findShow(data, 2)).toBe(show);
  });
});
