import type { Show } from '@/interfaces/api/models/Show';

/** One row of the biggest shows list beside the storage chart. */
export interface StorageShowRow {
  show: Show;
  title: string;
  /** The color of the show's arc, so the row and the arc read as one. */
  color: string;
  /** The formatted size, such as `12.4 GB`. */
  size: string;
  /** The show's share of all video files, 0 to 100. */
  share: number;
}
