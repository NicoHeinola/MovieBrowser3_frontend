import type { WebsiteTag } from './WebsiteTag';

export interface Website {
  id: number;
  url: string;
  title: string | null;
  icon: string | null;
  description: string | null;
  tags: WebsiteTag[];
  created_at: string;
  updated_at: string;
}
