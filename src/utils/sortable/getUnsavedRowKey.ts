import { toRaw } from 'vue';

/** Keys of rows without a backend id. Weak, so a removed row takes its key with it. */
const unsavedRowKeys = new WeakMap<object, string>();

let lastUnsavedRowKey = 0;

/**
 * Gives a row that has no backend id a key that stays the same for as long as the row exists.
 *
 * @param row The row, reactive or raw.
 * @returns The key of the row.
 */
export const getUnsavedRowKey = (row: object): string => {
  // A row reaches this as a reactive proxy or as the raw object, and both must get the same key.
  const rawRow = toRaw(row);
  const existingKey = unsavedRowKeys.get(rawRow);

  if (existingKey !== undefined) {
    return existingKey;
  }

  lastUnsavedRowKey += 1;

  const key = `unsaved-${lastUnsavedRowKey}`;
  unsavedRowKeys.set(rawRow, key);

  return key;
};
