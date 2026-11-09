/** The display-only status of a show whose entries have different watch statuses, with how it looks. */
export const MIXED_WATCH_STATUS = {
  /** The status value, offered next to the real `WatchStatus` values. */
  value: 'mixed',
  /** i18n key of its label. */
  titleKey: 'show.mixed',
  /** Theme color. */
  color: 'watch-status-mixed',
  icon: 'mdi-tag-multiple',
} as const;
