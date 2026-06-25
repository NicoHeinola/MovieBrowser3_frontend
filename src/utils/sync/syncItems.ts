/**
 * Syncs a collection of items with the backend by creating new items,
 * updating existing ones, and deleting removed ones.
 *
 * @param newItems - The new/current items to sync
 * @param oldItems - The original items before changes
 * @param endpoints - Service methods for create, update, and delete operations
 * @param idKey - The property name used to identify items (default: 'id')
 * @returns Promise that resolves when all sync operations complete
 *
 * @example
 * await syncItems(
 *   show.value.titles,
 *   originalShow.value?.titles ?? [],
 *   {
 *     create: (title) => showTitleService.create(title),
 *     update: (id, title) => showTitleService.update(id, title),
 *     delete: (id) => showTitleService.remove(id)
 *   }
 * );
 */
export const syncItems = async <T extends Record<string, unknown>, K extends keyof T = 'id' & keyof T>(
  newItems: T[],
  oldItems: T[],
  endpoints: {
    create: (item: T) => Promise<T>;
    update: (id: T[K], item: T) => Promise<void>;
    delete: (id: T[K]) => Promise<void>;
  },
  idKey: K = 'id' as K,
): Promise<void> => {
  // Create new items and update existing ones
  for (const newItem of newItems) {
    if (newItem[idKey]) {
      // Item exists, update it
      await endpoints.update(newItem[idKey], newItem);
    } else {
      // Item is new, create it and assign the returned ID back
      const createdItem = await endpoints.create(newItem);
      newItem[idKey] = createdItem[idKey];
    }
  }

  // Delete items that were removed
  for (const oldItem of oldItems) {
    if (!newItems.some((item) => item[idKey] === oldItem[idKey])) {
      await endpoints.delete(oldItem[idKey]);
    }
  }
};
