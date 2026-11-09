import type { DeleteRemovedItemsOptions } from './DeleteRemovedItemsOptions';

import { getSyncPlan } from './getSyncPlan';

/**
 * Deletes the old items that `newItems` no longer has. Deleted items are removed from `oldItems`, so calling this
 * again after a partial failure does not delete them twice.
 *
 * @param newItems - The items to keep. Can hold more than the list `oldItems` came from, such as items moved here
 * from other lists, which are then kept.
 * @param oldItems - The original items before changes.
 * @param options - Sync configuration.
 * @returns Promise that resolves when every delete finished.
 */
export const deleteRemovedItems = async <T extends Record<string, unknown>, K extends keyof T = 'id' & keyof T>(
  newItems: T[],
  oldItems: T[],
  options: DeleteRemovedItemsOptions<T, K>,
): Promise<void> => {
  const idKey = (options.idKey ?? 'id') as K;
  const { toDelete } = getSyncPlan(newItems, oldItems, idKey);

  for (const item of toDelete) {
    await options.delete(item[idKey]);
    oldItems.splice(oldItems.indexOf(item), 1);
    await options.onItem?.('delete', item);
  }
};
