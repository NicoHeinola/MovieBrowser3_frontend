import type { ComputedRef } from 'vue';
import { makeSortableList } from '@vue-dnd-kit/core';
import { computed } from 'vue';

interface SortableItemsOptions<T> {
  /** Reads the list from its owner. */
  getItems: () => T[];
  /** Takes the new order of a drop. Only drops call it. */
  setItems: (items: T[]) => void;
  /** Key of an item. Default: `item.id`. */
  getKey?: (item: T) => string;
  /** Whether dragging is off, for the pointer and the keyboard. */
  isDisabled?: () => boolean;
}

/**
 * Makes an element a sortable list whose rows are `SortableItem`s.
 *
 * @param target Element that holds the rows.
 * @param options Where the list lives and how its rows behave.
 * @returns The items in their draft order, which moves during a drag. Render this, not the source list.
 */
export const useSortableItems = <T>(
  target: Parameters<typeof makeSortableList>[0],
  { getItems, setItems, getKey, isDisabled }: SortableItemsOptions<T>,
): ComputedRef<T[]> => {
  const { items } = makeSortableList<T>(target, {
    disabled: isDisabled,
    getKey,
    items: computed<T[]>({ get: getItems, set: setItems }),
  });

  return items;
};
