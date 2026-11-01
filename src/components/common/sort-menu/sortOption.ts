/** One choice in a sort menu. */
export interface SortOption {
  /** Sort value, e.g. a backend sort such as `-created_at`. */
  value: string;
  /** i18n key of the option's label. */
  titleKey: string;
  icon: string;
}
