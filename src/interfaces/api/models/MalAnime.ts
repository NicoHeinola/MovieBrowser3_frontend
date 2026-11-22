/** One anime of a MyAnimeList (MAL) search. Details MAL leaves out are null. */
export interface MalAnime {
  /** MAL's anime id. */
  id: number;
  title: string;
  /** Its MAL page, which the show editor can fill a show in from. */
  url: string;
  /** A small cover thumbnail. */
  image_url: string | null;
  /** Such as `TV`, `Movie` or `ONA`, as MAL writes it. */
  media_type: string | null;
  start_year: number | null;
  /** Such as `Finished Airing`, as MAL writes it. */
  status: string | null;
  /** MAL's score as it writes it, such as `8.40`; null before anyone scored it. */
  score: string | null;
}
