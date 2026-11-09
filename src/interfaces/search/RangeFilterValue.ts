/** The bounds of a range filter. */
export interface RangeFilterValue {
  /** Smallest accepted number, or null for no lower bound. */
  min: number | null;
  /** Largest accepted number, or null for no upper bound. */
  max: number | null;
}
