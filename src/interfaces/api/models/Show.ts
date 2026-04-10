import type { ShowTitle } from '../ShowTitle';

export interface Show {
  id: number;
  banner_url: string; // More horizontal
  card_image_url: string; // More vertical
  preview_url: string | null;
  titles: ShowTitle[];
}
