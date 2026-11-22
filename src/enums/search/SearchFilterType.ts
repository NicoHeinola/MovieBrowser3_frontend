/** How a search filter is stored and shown. */
export enum SearchFilterType {
  /** A group of chips that each include, exclude or ignore one value. */
  Chips = 'chips',
  /** An on/off switch. */
  Switch = 'switch',
  /** A minimum and a maximum number, either of which can be left empty. */
  Range = 'range',
  /** One value picked from a group of chips, for a backend that takes a single value; one option filters nothing. */
  Choice = 'choice',
}
