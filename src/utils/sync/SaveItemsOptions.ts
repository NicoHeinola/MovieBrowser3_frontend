import type { ObjectChangeCheckOptions } from '@/utils/object/ObjectChangeCheckOptions';

/** How `saveItems` reaches the backend. */
export interface SaveItemsOptions<T, K extends keyof T> {
  /** The property name used to identify items (default: `'id'`). */
  idKey?: K;
  /** Paths to include or exclude when deciding whether an existing item changed. */
  compareOptions?: ObjectChangeCheckOptions;
  /** Service method to create a new item. */
  create: (item: T) => Promise<T>;
  /** Service method to update an existing item by id. */
  update: (id: T[K], item: T) => Promise<void>;
  /** Called after each create or update. */
  onItem?: (action: 'create' | 'update', item: T) => Promise<void> | void;
}
