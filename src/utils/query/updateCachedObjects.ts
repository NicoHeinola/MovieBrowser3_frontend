/**
 * Rewrites objects anywhere inside cached query data, whatever its shape, such as a list, a paginated response or a map
 * of lists. Only the objects along a changed path are copied, so untouched items keep their references.
 * @param data - The cached query data.
 * @param update - Called with each object in the data. Return a new object to replace it, or the same object to keep it
 * and look inside it.
 * @returns The updated data, or the same reference when nothing changed.
 */
export const updateCachedObjects = <T>(
  data: T,
  update: (record: Record<string, unknown>) => Record<string, unknown>,
): T => {
  /**
   * Walks one value of the data. It returns the same reference when nothing inside changed and a copy when something
   * did. Vue Query and Vue compare by reference, so unchanged lists and items don't trigger re-renders.
   */
  const patch = (value: unknown): unknown => {
    // Lists: patch every item, but only build a new array when at least one item actually changed.
    if (Array.isArray(value)) {
      const items = value.map((item) => patch(item));
      return items.some((patched, index) => patched !== value[index]) ? items : value;
    }

    // Strings, numbers, booleans and null hold nothing to look inside, so they are kept as they are.
    if (value === null || typeof value !== 'object') {
      return value;
    }

    const record = value as Record<string, unknown>;
    const updated = update(record);

    // The caller replaced this object, for example the saved website, so its old contents are not searched.
    if (updated !== record) {
      return updated;
    }

    // Not a match: search its fields, such as `data` on a paginated response. The object is copied only once, on the
    // first changed field; later changed fields are written into that same copy.
    let result = record;
    for (const [key, child] of Object.entries(record)) {
      const patched = patch(child);
      if (patched !== child) {
        result = result === record ? { ...record } : result;
        result[key] = patched;
      }
    }
    return result;
  };

  return patch(data) as T;
};
