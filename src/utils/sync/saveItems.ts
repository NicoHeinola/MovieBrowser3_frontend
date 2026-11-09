import type { SaveItemsOptions } from './SaveItemsOptions';

import { getSyncPlan } from './getSyncPlan';

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
