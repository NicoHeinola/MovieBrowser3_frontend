import type { ChipsFilterValue } from './ChipsFilterValue';
import type { RangeFilterValue } from './RangeFilterValue';

/** The value of one search filter: a chips selection, a switch, a number range or a single choice. */
export type SearchFilterValue = ChipsFilterValue | RangeFilterValue | boolean | string;
