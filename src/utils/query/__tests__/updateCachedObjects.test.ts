import { describe, expect, it } from 'vitest';

import { updateCachedObjects } from '../updateCachedObjects';

/**
 * Replaces the item with id 2 by a renamed copy.
 * @param record - An object from the cached data.
 * @returns The renamed copy, or the same object.
 */
const renameSecond = (record: Record<string, unknown>): Record<string, unknown> =>
  record.id === 2 ? { ...record, name: 'Renamed' } : record;

describe('updateCachedObjects', () => {
  it('replaces matching items in a list and keeps the others by reference', () => {
    const first = { id: 1, name: 'First' };
    const data = [first, { id: 2, name: 'Second' }];

    const result = updateCachedObjects(data, renameSecond);

    expect(result).toEqual([first, { id: 2, name: 'Renamed' }]);
    expect(result).not.toBe(data);
    expect(result[0]).toBe(first);
  });

  it('reaches items inside paginated responses and maps of lists', () => {
    const untouched = [{ id: 5 }];
    const data = { meta: { total: 1 }, data: [{ id: 2, name: 'Second' }], sections: { a: untouched } };

    const result = updateCachedObjects(data, renameSecond);

    expect(result.data).toEqual([{ id: 2, name: 'Renamed' }]);
    expect(result.meta).toBe(data.meta);
    expect(result.sections).toBe(data.sections);
    expect(result.sections.a).toBe(untouched);
  });

  it('does not look inside a replaced object', () => {
    const data = [{ id: 2, children: [{ id: 2 }] }];

    const result = updateCachedObjects(data, renameSecond);

    expect(result).toEqual([{ id: 2, name: 'Renamed', children: [{ id: 2 }] }]);
  });

  it('returns the same reference when nothing matches', () => {
    const data = { data: [{ id: 1 }], meta: null, count: 3 };

    expect(updateCachedObjects(data, renameSecond)).toBe(data);
    expect(updateCachedObjects(undefined, renameSecond)).toBeUndefined();
  });
});
