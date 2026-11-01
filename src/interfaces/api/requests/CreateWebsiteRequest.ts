export interface CreateWebsiteRequest {
  url: string;
  title: string | null;
  icon: string | null;
  description: string | null;
  is_favorite: boolean;
  tag_ids: number[];
}
