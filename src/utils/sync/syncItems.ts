/**
 * Syncs a collection of items with the backend by creating new items,
 * updating existing ones, and deleting removed ones.
 *
 * @param newItems - The new/current items to sync
 * @param oldItems - The original items before changes
 * @param options - Sync configuration
 * @param options.create - Service method to create a new item
 * @param options.update - Service method to update an existing item by id
 * @param options.delete - Service method to delete an item by id
 * @param options.idKey - The property name used to identify items (default: `'id'`)
 * @param options.onItem - Optional callback invoked after each create, update, or delete operation.
 *   Receives the action type and the affected item. Use this to hook additional sync logic,
 *   such as syncing sub-resources (e.g. episodes of an entry) after the parent operation.
 * @returns Promise that resolves when all sync operations complete
 *
 * @example
 * await syncItems(
 *   show.value.entries,
 *   originalShow.value?.entries ?? [],
 *   {
 *     create: (entry) => showEntryService.create(entry),
 *     update: (id, entry) => showEntryService.update(id, entry),
 *     delete: (id) => showEntryService.remove(id),
 *     onItem: async (action, entry) => {
 *       if (action !== 'delete') {
 *         await syncItems(entry.episodes, originalEpisodes, { ... });
 *       }
 *     },
 *   },
 * );
 */
export const syncItems = async <T extends Record<string, unknown>, K extends keyof T = 'id' & keyof T>(
  newItems: T[],
  oldItems: T[],
  options: {
    idKey?: K;
    create: (item: T) => Promise<T>;
    update: (id: T[K], item: T) => Promise<void>;
    delete: (id: T[K]) => Promise<void>;
    onItem?: (action: 'create' | 'update' | 'delete', item: T) => Promise<void> | void;
  },
): Promise<void> => {
  const idKey = (options.idKey ?? 'id') as K;

  // Create new items and update existing ones
  for (const newItem of newItems) {
    if (newItem[idKey]) {
      // Item exists, update it
      await options.update(newItem[idKey], newItem);
      await options.onItem?.('update', newItem);
    } else {
      // Item is new, create it and assign the returned ID back
      const createdItem = await options.create(newItem);
      newItem[idKey] = createdItem[idKey];
      await options.onItem?.('create', newItem);
    }
  }

  // Delete items that were removed
  for (const oldItem of oldItems) {
    if (!newItems.some((item) => item[idKey] === oldItem[idKey])) {
      await options.delete(oldItem[idKey]);
      await options.onItem?.('delete', oldItem);
    }
  }
};
