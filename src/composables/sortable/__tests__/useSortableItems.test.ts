import type { Ref } from 'vue';

import { makeSortableList } from '@vue-dnd-kit/core';
import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { useSortableItems } from '../useSortableItems';

vi.mock('@vue-dnd-kit/core', () => ({
  makeSortableList: vi.fn((_target: unknown, options: { items: Ref<unknown[]> }) => ({ items: options.items })),
}));

describe('useSortableItems', () => {
  it('reads the list from its owner and hands drops back', () => {
    const list = ref<string[]>(['a', 'b']);
    const setItems = vi.fn();

    const items = useSortableItems<string>(ref(null), { getItems: () => list.value, setItems });
    const { items: source } = vi.mocked(makeSortableList).mock.lastCall![1];

    expect(items.value).toEqual(['a', 'b']);

    (source as Ref<string[]>).value = ['b', 'a'];

    expect(setItems).toHaveBeenCalledWith(['b', 'a']);
  });

  it('passes the key and the disabled state on', () => {
    const getKey = (item: string): string => item;
    const isDisabled = (): boolean => true;

    useSortableItems<string>(ref(null), { getItems: () => [], setItems: vi.fn(), getKey, isDisabled });

    expect(vi.mocked(makeSortableList).mock.lastCall![1]).toMatchObject({ getKey, disabled: isDisabled });
  });
});
