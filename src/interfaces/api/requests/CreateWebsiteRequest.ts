export interface CreateWebsiteRequest {
  url: string;
  title: string | null;
  icon: string | null;
  description: string | null;
  tag_ids: number[];
}
