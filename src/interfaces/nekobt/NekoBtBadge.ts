/** One badge of a nekoBT torrent, such as its level or "Batch". */
export interface NekoBtBadge {
  /** Unique among one torrent's badges, for list keys. */
  key: string;
  /** i18n key of the badge text. */
  textKey: string;
  /** i18n key of what the badge means, shown in the badge help. */
  descriptionKey?: string;
  /** Theme color of the badge background. */
  color: string;
}
