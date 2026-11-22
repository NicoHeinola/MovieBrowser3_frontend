/** The filters of a nyaa search, as nyaa's own values. */
export interface NyaaSearchFilters {
  /** nyaa category code, such as `1_2` for English-translated anime; `0_0` is every category. */
  category: string;
  /** nyaa trust filter: `0` everything, `1` no remakes, `2` trusted only. */
  trust: string;
}
