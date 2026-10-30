import type { ObjectChangeCheckOptions } from '@/utils/object/hasObjectChanged';

import { getSyncPlan } from './getSyncPlan';

/**
 * Syncs a collection of items with the backend by creating new items,
 * updating changed ones, and deleting removed ones.
 *
 * Created items get their returned id assigned back, and deleted items are removed from `oldItems`,
 * so calling this again after a partial failure only retries the work that did not finish.
 *
 * @param newItems - The new/current items to sync
 * @param oldItems - The original items before changes
 * @param options - Sync configuration
 * @param options.create - Service method to create a new item
 * @param options.update - Service method to update an existing item by id
 * @param options.delete - Service method to delete an item by id
 * @param options.idKey - The property name used to identify items (default: `'id'`)
 * @param options.compareOptions - Paths to include or exclude when deciding whether an existing item changed
 * @param options.onItem - Optional callback invoked after each create, update, or delete operation.
 * @returns Promise that resolves when all sync operations complete
 *
 * @example
 * await syncItems(show.value.titles, originalShow.value?.titles ?? [], {
 *   create: (title) => showTitleService.create(show.value.id, title),
 *   update: async (id, title) => {
 *     await showTitleService.update(id, title);
 *   },
 *   delete: (id) => showTitleService.remove(id),
 * });
 */
export const syncItems = async <T extends Record<string, unknown>, K extends keyof T = 'id' & keyof T>(
  newItems: T[],
  oldItems: T[],
  options: {
    idKey?: K;
    compareOptions?: ObjectChangeCheckOptions;
    create: (item: T) => Promise<T>;
    update: (id: T[K], item: T) => Promise<void>;
    delete: (id: T[K]) => Promise<void>;
    onItem?: (action: 'create' | 'update' | 'delete', item: T) => Promise<void> | void;
  },
): Promise<void> => {
  const idKey = (options.idKey ?? 'id') as K;
  const { toCreate, toUpdate, toDelete } = getSyncPlan(newItems, oldItems, idKey, options.compareOptions);

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

  for (const item of toDelete) {
    await options.delete(item[idKey]);
    oldItems.splice(oldItems.indexOf(item), 1);
    await options.onItem?.('delete', item);
  }
};
