import type { ChipsFilterValue } from '@/interfaces/search/ChipsFilterValue';

/** Filters the nekoBT search applies on top of the search term. */
export interface NekoBtSearchFilters {
  /** `NekoBtLevel` values; excluding one allows every other level. */
  level: ChipsFilterValue;
  /** `NekoBtVideoSource` values; excluding one allows every other source. */
  videoSource: ChipsFilterValue;
  /** `NekoBtVideoCodec` values; excluding one allows every other codec. */
  videoCodec: ChipsFilterValue;
  /** A language code the audio must include, or `any`. */
  audioLanguage: string;
  /** `true` for batches only, `false` for single releases only, or `any`. */
  batch: string;
  originalTranslationOnly: boolean;
  hideMachineTranslations: boolean;
  hideHardsubs: boolean;
}
