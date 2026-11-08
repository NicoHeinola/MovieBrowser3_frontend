import type { StorageSlice } from './StorageSlice';

/** The two rings of the storage chart. */
export interface StorageRings {
  /** Videos, other files and free space; null when the backend does not know the disk. */
  disk: StorageSlice[] | null;
  /** The biggest shows, the rest grouped, plus a `gap` covering the non-video part of the disk when it is known. */
  shows: StorageSlice[];
}
