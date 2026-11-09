import type { DeleteRemovedItemsOptions } from './deleteRemovedItems';
import type { SaveItemsOptions } from './saveItems';

import { deleteRemovedItems } from './deleteRemovedItems';
import { saveItems } from './saveItems';

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
  options: Omit<SaveItemsOptions<T, K>, 'onItem'> &
    Omit<DeleteRemovedItemsOptions<T, K>, 'onItem'> & {
      onItem?: (action: 'create' | 'update' | 'delete', item: T) => Promise<void> | void;
    },
): Promise<void> => {
  await saveItems(newItems, oldItems, options);
  await deleteRemovedItems(newItems, oldItems, options);
};
