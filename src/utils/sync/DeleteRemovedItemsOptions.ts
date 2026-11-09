/** How `deleteRemovedItems` reaches the backend. */
export interface DeleteRemovedItemsOptions<T, K extends keyof T> {
  /** The property name used to identify items (default: `'id'`). */
  idKey?: K;
  /** Service method to delete an item by id. */
  delete: (id: T[K]) => Promise<void>;
  /** Called after each delete. */
  onItem?: (action: 'delete', item: T) => Promise<void> | void;
}
