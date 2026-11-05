import type { ChipsFilterValue } from './ChipsFilterValue';
import type { SearchFilterType } from '@/enums/search/SearchFilterType';
import type { ComputedRef, Ref } from 'vue';

/** The settings every filter has. */
interface BaseFilterDefinition<TKey extends string> {
  /** Field of the filter in the domain's filters. */
  key: TKey;
  /** URL query param. A chips filter keeps its excluded values in `exclude_<param>`. */
  param: string;
  /** i18n key of the section title. */
  title: string;
  /** The section subtitle, with one word highlighted for including and one for excluding. */
  hint?: {
    /** i18n key of the subtitle. */
    keypath: string;
    /** Placeholder of the include word, which is also its key under `filter`. */
    include: string;
    /** Placeholder of the exclude word, which is also its key under `filter`. */
    exclude: string;
  };
}

/** A group of chips that each include, exclude or ignore one value. */
interface ChipsFilterDefinition<TKey extends string> extends BaseFilterDefinition<TKey> {
  type: SearchFilterType.Chips;
  /** Backend params of the included and excluded values, or a function for a backend that takes another shape. */
  api: { include: string; exclude: string } | ((value: ChipsFilterValue) => Record<string, string>);
  /** Composable that provides the chips. Selected values without a chip are dropped once the options have loaded. */
  useOptions: () => {
    options: ComputedRef<{ value: string; text: string; icon?: string; color?: string }[]>;
    /** Whether the options are still loading. Leave it out for options that are known right away. */
    isPending?: Ref<boolean>;
  };
  /** i18n key of the text shown when there are no options. */
  emptyText?: string;
}

/** An on/off switch. */
interface SwitchFilterDefinition<TKey extends string> extends BaseFilterDefinition<TKey> {
  type: SearchFilterType.Switch;
  /** Backend params sent while the switch is on. */
  api: Record<string, string>;
  /** i18n key of the switch label. */
  label: string;
}

/** One search filter: how it is stored in the URL, sent to the backend and shown in the filter drawer. */
export type SearchFilterDefinition<TKey extends string = string> =
  ChipsFilterDefinition<TKey> | SwitchFilterDefinition<TKey>;
