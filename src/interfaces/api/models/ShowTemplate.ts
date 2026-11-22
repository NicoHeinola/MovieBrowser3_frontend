import type { Category } from './Category';

/**
 * A show as an outside page (such as a nekoBT media page) describes it, for the show editor to start from. Seasons and
 * episodes aren't part of it: the user adds those.
 */
export interface ShowTemplate {
  /** The page the template was made from. */
  source_url: string;
  /** The show's titles; the first is the one to show. Can be empty. */
  titles: string[];
  description: string | null;
  banner_url: string | null;
  card_image_url: string | null;
  preview_url: string | null;
  /** The app's categories that match the page's genres. */
  categories: Category[];
  /** Genres no category matches. */
  unmatched_genres: string[];
}
