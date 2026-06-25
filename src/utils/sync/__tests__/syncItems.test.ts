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

    const create = vi.fn(
      async (item: TestItem): Promise<TestItem> => ({
        ...item,
        id: Math.random(),
      }),
    );
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
    expect(update).toHaveBeenCalledTimes(1);
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

    const create = vi.fn(
      async (item: TestItem): Promise<TestItem> => ({
        ...item,
        id: Math.random(),
      }),
    );
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
    const newItems: CustomItem[] = [{ customId: 'a', value: 'val1' }];
    const oldItems: CustomItem[] = [
      { customId: 'a', value: 'val1' },
      { customId: 'b', value: 'val2' },
    ];

    const create = vi.fn();
    const update = vi.fn();
    const remove = vi.fn();

    await syncItems(newItems, oldItems, { create, update, delete: remove }, 'customId' as const);

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith('a', newItems[0]);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith('b');
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

    const create = vi.fn(
      async (item: TestItem): Promise<TestItem> => ({
        ...item,
        id: 42,
      }),
    );
    const update = vi.fn();
    const remove = vi.fn();

    await syncItems(newItems, oldItems, { create, update, delete: remove });

    expect(newItems[0].id).toBe(42);
  });
});
