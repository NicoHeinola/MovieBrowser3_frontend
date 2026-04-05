import type { ShowTitle } from './ShowTitle';

export interface Show {
  id: number;
  banner_url: string; // A URL for a banner image or video
  card_image_url: string; // A smaller image that can be used as a thumbnail for the show in a card
  titles: ShowTitle[];
}
