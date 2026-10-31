import type { HomepageSection } from './HomepageSection';
import type { Show } from '@/interfaces/api/models/Show';

export interface HomeShowsResponse {
  latestShows: Show[];
  randomShows: Show[];
  categorySections: HomepageSection[];
  categoryShows: Record<string, Show[]>;
}
