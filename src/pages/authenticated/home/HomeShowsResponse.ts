import type { Show } from '@/interfaces/api/models/Show';

export interface HomeShowsResponse {
  latestShows: Show[];
  continueToWatchShows: Show[];
  isekaiShows: Show[];
  romanceShows: Show[];
  randomShows: Show[];
}
