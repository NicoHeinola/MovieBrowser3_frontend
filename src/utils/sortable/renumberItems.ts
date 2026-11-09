/**
 * Numbers items by their place in the list, so the saved order matches what the user sees.
 *
 * @param items The items, in order. Changed in place.
 * @param key The field that holds the order, such as `sort_order` or an episode's `sequence_number`.
 * @returns Nothing.
 */
export const renumberItems = <K extends string>(items: Record<K, number>[], key: K): void => {
  for (const [index, item] of items.entries()) {
    item[key] = index;
  }
};
