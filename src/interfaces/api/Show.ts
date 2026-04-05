import type { ShowTitle } from './ShowTitle';

export interface Show {
  id: number;
  hero_image_url: string; // A big image that can be used as a banner for the show
  card_image_url: string; // A smaller image that can be used as a thumbnail for the show in a card
  titles: ShowTitle[];
}
