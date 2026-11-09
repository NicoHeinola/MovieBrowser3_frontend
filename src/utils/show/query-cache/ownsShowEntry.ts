/**
 * Checks whether a cached object is the show that owns an entry. Matching the entry as well as the show id keeps
 * nested objects that share the id, such as categories, from matching.
 * @param record - Any object inside cached query data.
 * @param showId - The id of the show that owns the entry.
 * @param entryId - The id of the entry.
 * @returns Whether the object is that show and lists that entry.
 */
export const ownsShowEntry = (record: Record<string, unknown>, showId: number, entryId: number): boolean => {
  const entries = record.entries as { id: number; show_id: number }[] | undefined;

  return (
    record.id === showId &&
    Array.isArray(entries) &&
    entries.some((entry) => entry.id === entryId && entry.show_id === showId)
  );
};
