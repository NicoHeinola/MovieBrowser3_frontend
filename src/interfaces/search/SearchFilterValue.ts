import type { ChipsFilterValue } from './ChipsFilterValue';
import type { RangeFilterValue } from './RangeFilterValue';

/** The value of one search filter: a chips selection, a switch or a number range. */
export type SearchFilterValue = ChipsFilterValue | RangeFilterValue | boolean;
