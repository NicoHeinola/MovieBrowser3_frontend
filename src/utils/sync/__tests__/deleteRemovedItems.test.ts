import { describe, expect, it, vi } from 'vitest';
import { deleteRemovedItems } from '../deleteRemovedItems';

interface TestItem {
  id?: number;
  name: string;
}

describe('deleteRemovedItems', () => {
  it('deletes only old items that no new item has, and drops them from the old list', async () => {
    const oldItems: TestItem[] = [
      { id: 1, name: 'kept' },
      { id: 2, name: 'removed' },
    ];
    const remove = vi.fn(async () => {});

    await deleteRemovedItems([{ id: 1, name: 'kept' }], oldItems, { delete: remove });

    expect(remove).toHaveBeenCalledExactlyOnceWith(2);
    expect(oldItems).toEqual([{ id: 1, name: 'kept' }]);
  });

  it('keeps an item that moved to another list, when the new items cover every list', async () => {
    const firstList: TestItem[] = [{ id: 1, name: 'moved' }];
    const remove = vi.fn(async () => {});

    // Item 1 now lives in the second list, which is part of the new items too.
    await deleteRemovedItems([{ id: 1, name: 'moved' }], firstList, { delete: remove });

    expect(remove).not.toHaveBeenCalled();
  });
});
