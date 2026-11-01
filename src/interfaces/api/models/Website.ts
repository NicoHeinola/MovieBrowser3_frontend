import type { WebsiteTag } from './WebsiteTag';

export interface Website {
  id: number;
  url: string;
  title: string | null;
  icon: string | null;
  description: string | null;
  /** Favorite websites are listed on the admin dashboard. */
  is_favorite: boolean;
  tags: WebsiteTag[];
  created_at: string;
  updated_at: string;
}
