/** One nyaa mirror the "Search on nyaa" button can open. */
export interface NyaaMirror {
  /** Host name shown in the mirror menu, such as `nyaa.si`. */
  host: string;
  /** Address the search is opened on, without a trailing slash. */
  url: string;
}
