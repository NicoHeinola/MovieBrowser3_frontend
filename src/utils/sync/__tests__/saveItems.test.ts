import { describe, expect, it } from 'vitest';
import { saveItems } from '../saveItems';

interface TestItem {
  id?: number;
  name: string;
}

describe('saveItems', () => {
  it('creates and updates in list order, and never deletes', async () => {
    const created: TestItem = { name: 'new' };
    const newItems: TestItem[] = [created, { id: 2, name: 'renamed' }];
    const oldItems: TestItem[] = [
      { id: 2, name: 'old' },
      { id: 3, name: 'removed' },
    ];
    const calls: string[] = [];

    await saveItems(newItems, oldItems, {
      create: async (item) => {
        calls.push(`create ${item.name}`);
        return { ...item, id: 9 };
      },
      update: async (id) => {
        calls.push(`update ${id}`);
      },
    });

    expect(calls).toEqual(['create new', 'update 2']);
    expect(created.id).toBe(9);
    expect(oldItems).toHaveLength(2);
  });
});
