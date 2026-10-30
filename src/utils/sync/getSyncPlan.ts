import type { ObjectChangeCheckOptions } from '@/utils/object/hasObjectChanged';

import { getChangedObject } from '@/utils/object/hasObjectChanged';

/**
 * Work out which items need to be created, updated or deleted to turn `oldItems` into `newItems`.
 * Items with an id that are deep-equal to their original are left out of `toUpdate`.
 *
 * @param newItems The new/current items.
 * @param oldItems The original items before changes.
 * @param idKey The property name used to identify items.
 * @param compareOptions Paths to include or exclude when deciding whether an existing item changed.
 * @returns The items to create, update and delete.
 */
export const getSyncPlan = <T extends Record<string, unknown>, K extends keyof T>(
  newItems: T[],
  oldItems: T[],
  idKey: K,
  compareOptions: ObjectChangeCheckOptions = {},
): { toCreate: T[]; toUpdate: T[]; toDelete: T[] } => {
  const toCreate = newItems.filter((item) => !item[idKey]);
  const toUpdate = newItems.filter((item) => {
    if (!item[idKey]) {
      return false;
    }

    const oldItem = oldItems.find((existingItem) => existingItem[idKey] === item[idKey]);

    return oldItem === undefined || getChangedObject(oldItem, item, compareOptions) !== undefined;
  });
  const toDelete = oldItems.filter((oldItem) => !newItems.some((item) => item[idKey] === oldItem[idKey]));

  return { toCreate, toUpdate, toDelete };
};
