import type { ObjectChangeCheckOptions } from '@/utils/object/ObjectChangeCheckOptions';

import { getSyncPlan } from './getSyncPlan';

/** How `saveItems` reaches the backend. */
export interface SaveItemsOptions<T, K extends keyof T> {
  /** The property name used to identify items (default: `'id'`). */
  idKey?: K;
  /** Paths to include or exclude when deciding whether an existing item changed. */
  compareOptions?: ObjectChangeCheckOptions;
  /** Service method to create a new item. */
  create: (item: T) => Promise<T>;
  /** Service method to update an existing item by id. */
  update: (id: T[K], item: T) => Promise<void>;
  /** Called after each create or update. */
  onItem?: (action: 'create' | 'update', item: T) => Promise<void> | void;
}

/**
 * Creates new items and updates changed ones, in the order of `newItems`. Created items get their returned id
 * assigned back, so calling this again after a partial failure does not create them twice.
 *
 * @param newItems - The new/current items to save.
 * @param oldItems - The original items before changes.
 * @param options - Sync configuration.
 * @returns Promise that resolves when every create and update finished.
 */
export const saveItems = async <T extends Record<string, unknown>, K extends keyof T = 'id' & keyof T>(
  newItems: T[],
  oldItems: T[],
  options: SaveItemsOptions<T, K>,
): Promise<void> => {
  const idKey = (options.idKey ?? 'id') as K;
  const { toCreate, toUpdate } = getSyncPlan(newItems, oldItems, idKey, options.compareOptions);

  for (const item of newItems) {
    if (toCreate.includes(item)) {
      const createdItem = await options.create(item);
      item[idKey] = createdItem[idKey];
      await options.onItem?.('create', item);
    } else if (toUpdate.includes(item)) {
      await options.update(item[idKey], item);
      await options.onItem?.('update', item);
    }
  }
};
