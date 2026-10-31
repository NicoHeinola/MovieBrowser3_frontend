/** One choice in a sort menu. */
export interface SortOption {
  /** Sort value, e.g. a backend sort such as `-created_at`. */
  value: string;
  title: string;
  icon: string;
}
