export interface WebsiteTag {
  id: number;
  name: string;
  /** Number of websites using the tag, present on tag listings. */
  websites_count?: number;
}
