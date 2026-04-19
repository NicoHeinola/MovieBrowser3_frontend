import type { ShowEntry } from './ShowEntry';
import type { ShowLink } from './ShowLink';
import type { ShowTitle } from './ShowTitle';

export interface Show {
  id: number;
  banner_url: string; // More horizontal
  card_image_url: string; // More vertical
  preview_url: string | null;
  description: string;
  titles: ShowTitle[];
  entries?: ShowEntry[];
  outgoingLinks?: ShowLink[];
  incomingLinks?: ShowLink[];
}
