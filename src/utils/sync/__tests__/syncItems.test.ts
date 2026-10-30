import { describe, expect, it, vi } from 'vitest';
import { syncItems } from '../syncItems';

interface TestItem {
  id?: number;
  name: string;
}

interface CustomItem {
  customId?: string;
  value: string;
}

describe('syncItems', () => {
  it('creates new items without ids', async () => {
    const newItems: TestItem[] = [{ name: 'item1' }, { name: 'item2' }];
    const oldItems: TestItem[] = [];

    const create = vi.fn(async (item: TestItem): Promise<TestItem> => ({
      ...item,
      id: Math.random(),
    }));
    const update = vi.fn();
    const remove = vi.fn();

    await syncItems(newItems, oldItems, { create, update, delete: remove });

    expect(create).toHaveBeenCalledTimes(2);
    expect(update).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
    expect(newItems[0].id).toBeDefined();
    expect(newItems[1].id).toBeDefined();
  });

  it('updates existing items with ids', async () => {
    const newItems: TestItem[] = [
      { id: 1, name: 'updated1' },
      { id: 2, name: 'updated2' },
    ];
    const oldItems: TestItem[] = [
      { id: 1, name: 'old1' },
      { id: 2, name: 'old2' },
    ];

    const create = vi.fn();
    const update = vi.fn();
    const remove = vi.fn();

    await syncItems(newItems, oldItems, { create, update, delete: remove });

    expect(create).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenCalledWith(1, newItems[0]);
    expect(update).toHaveBeenCalledWith(2, newItems[1]);
    expect(remove).not.toHaveBeenCalled();
  });

  it('deletes items removed from the collection', async () => {
    const newItems: TestItem[] = [{ id: 1, name: 'item1' }];
    const oldItems: TestItem[] = [
      { id: 1, name: 'item1' },
      { id: 2, name: 'item2' },
      { id: 3, name: 'item3' },
    ];

    const create = vi.fn();
    const update = vi.fn();
    const remove = vi.fn();

    await syncItems(newItems, oldItems, { create, update, delete: remove });

    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(remove).toHaveBeenCalledTimes(2);
    expect(remove).toHaveBeenCalledWith(2);
    expect(remove).toHaveBeenCalledWith(3);
  });

  it('handles mixed create, update, and delete operations', async () => {
    const newItems: TestItem[] = [{ id: 1, name: 'updated1' }, { name: 'new2' }, { name: 'new3' }];
    const oldItems: TestItem[] = [
      { id: 1, name: 'old1' },
      { id: 2, name: 'deleted2' },
    ];

    const create = vi.fn(async (item: TestItem): Promise<TestItem> => ({
      ...item,
      id: Math.random(),
    }));
    const update = vi.fn();
    const remove = vi.fn();

    await syncItems(newItems, oldItems, { create, update, delete: remove });

    expect(create).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(1, newItems[0]);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith(2);
  });

  it('respects custom id key parameter', async () => {
    const newItems: CustomItem[] = [{ customId: 'a', value: 'changed' }];
    const oldItems: CustomItem[] = [
      { customId: 'a', value: 'val1' },
      { customId: 'b', value: 'val2' },
    ];

    const create = vi.fn();
    const update = vi.fn();
    const remove = vi.fn();

    await syncItems(newItems, oldItems, { create, update, delete: remove, idKey: 'customId' as const });

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith('a', newItems[0]);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith('b');
  });

  it('skips existing items that did not change', async () => {
    const newItems: TestItem[] = [
      { id: 1, name: 'same' },
      { id: 2, name: 'changed' },
    ];
    const oldItems: TestItem[] = [
      { id: 1, name: 'same' },
      { id: 2, name: 'original' },
    ];

    const update = vi.fn();

    await syncItems(newItems, oldItems, { create: vi.fn(), update, delete: vi.fn() });

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(2, newItems[1]);
  });

  it('ignores excluded paths when deciding whether an item changed', async () => {
    const newItems = [{ id: 1, name: 'same', children: [1, 2] }];
    const oldItems = [{ id: 1, name: 'same', children: [1] }];

    const update = vi.fn();

    await syncItems(newItems, oldItems, {
      create: vi.fn(),
      update,
      delete: vi.fn(),
      compareOptions: { excludes: ['children'] },
    });

    expect(update).not.toHaveBeenCalled();
  });

  it('removes deleted items from oldItems so a retry does not delete them again', async () => {
    const newItems: TestItem[] = [];
    const oldItems: TestItem[] = [
      { id: 1, name: 'deleted' },
      { id: 2, name: 'fails' },
    ];

    const remove = vi.fn(async (id: number | undefined): Promise<void> => {
      if (id === 2) {
        throw new Error('network error');
      }
    });

    await expect(syncItems(newItems, oldItems, { create: vi.fn(), update: vi.fn(), delete: remove })).rejects.toThrow();
    expect(oldItems).toEqual([{ id: 2, name: 'fails' }]);

    remove.mockResolvedValue();
    await syncItems(newItems, oldItems, { create: vi.fn(), update: vi.fn(), delete: remove });

    expect(remove).toHaveBeenCalledTimes(3);
    expect(remove).not.toHaveBeenNthCalledWith(3, 1);
    expect(oldItems).toEqual([]);
  });

  it('handles empty collections', async () => {
    const create = vi.fn();
    const update = vi.fn();
    const remove = vi.fn();

    await syncItems([], [], { create, update, delete: remove });

    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('assigns created item ids back to original objects', async () => {
    const newItems: TestItem[] = [{ name: 'item1' }];
    const oldItems: TestItem[] = [];

    const create = vi.fn(async (item: TestItem): Promise<TestItem> => ({
      ...item,
      id: 42,
    }));
    const update = vi.fn();
    const remove = vi.fn();

    await syncItems(newItems, oldItems, { create, update, delete: remove });

    expect(newItems[0].id).toBe(42);
  });
});
