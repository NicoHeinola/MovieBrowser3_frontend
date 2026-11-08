import type { Show } from '@/interfaces/api/models/Show';

/** One arc of the storage chart. */
export interface StorageSlice {
  /** What the arc stands for. `gap` is an invisible filler that lines the show arcs up under the video arc. */
  kind: 'show' | 'otherShows' | 'videos' | 'otherFiles' | 'free' | 'gap';
  bytes: number;
  /** Set for `show` arcs only. */
  show?: Show;
}
