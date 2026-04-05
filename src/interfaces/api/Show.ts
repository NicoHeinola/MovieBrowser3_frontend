import type { ShowTitle } from './ShowTitle';

export interface Show {
  id: number;
  banner_url: string;
  card_image_url: string;
  preview_url: string | null;
  titles: ShowTitle[];
}
