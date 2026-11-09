import { describe, expect, it } from 'vitest';
import { renumberItems } from '../renumberItems';

describe('renumberItems', () => {
  it('numbers items by their place in the list, in the given field', () => {
    const items = [
      { name: 'a', sort_order: 4 },
      { name: 'b', sort_order: 0 },
      { name: 'c', sort_order: 9 },
    ];

    renumberItems(items, 'sort_order');

    expect(items).toEqual([
      { name: 'a', sort_order: 0 },
      { name: 'b', sort_order: 1 },
      { name: 'c', sort_order: 2 },
    ]);
  });
});
