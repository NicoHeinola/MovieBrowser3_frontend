export interface UpdateWebsiteRequest {
  url?: string;
  title?: string | null;
  icon?: string | null;
  description?: string | null;
  is_favorite?: boolean;
  /** Replaces every tag of the website. Leave it out to keep the current tags. */
  tag_ids?: number[];
}
