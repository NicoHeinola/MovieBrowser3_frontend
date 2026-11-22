import type { NekoBtSearchFilters } from '@/interfaces/nekobt/NekoBtSearchFilters';
import type { ChipsFilterValue } from '@/interfaces/search/ChipsFilterValue';
import type { SearchFilterDefinition } from '@/interfaces/search/SearchFilterDefinition';

import { useNekoBtAudioLanguageOptions } from '@/composables/nekobt/useNekoBtAudioLanguageOptions';
import { useNekoBtBatchOptions } from '@/composables/nekobt/useNekoBtBatchOptions';
import { useNekoBtLevelOptions } from '@/composables/nekobt/useNekoBtLevelOptions';
import { useNekoBtVideoCodecOptions } from '@/composables/nekobt/useNekoBtVideoCodecOptions';
import { useNekoBtVideoSourceOptions } from '@/composables/nekobt/useNekoBtVideoSourceOptions';
import { NekoBtLevel } from '@/enums/nekobt/NekoBtLevel';
import { NekoBtVideoCodec } from '@/enums/nekobt/NekoBtVideoCodec';
import { NekoBtVideoSource } from '@/enums/nekobt/NekoBtVideoSource';
import { SearchFilterType } from '@/enums/search/SearchFilterType';
import { getAnyOfValues } from '@/utils/filter/getAnyOfValues';

/**
 * Builds the backend params of a chips filter nekoBT takes as a list of allowed values, where excluding a value
 * allows every other one.
 * @param param - The backend filter param.
 * @param allValues - Every value the filter has.
 * @returns The params builder for the filter's `api`.
 */
const getAnyOfParams =
  (param: string, allValues: string[]) =>
  (chips: ChipsFilterValue): Record<string, string[]> => {
    const values = getAnyOfValues(chips, allValues);
    return values.length > 0 ? { [param]: values } : {};
  };

/** The filters of the nekoBT search, in drawer and URL order. */
export const nekoBtSearchFilterDefinitions: SearchFilterDefinition<keyof NekoBtSearchFilters>[] = [
  {
    key: 'level',
    type: SearchFilterType.Chips,
    param: 'level',
    title: 'torrents.filters.level',
    hint: { keypath: 'torrents.filters.anyOfHint', include: 'include', exclude: 'exclude' },
    api: getAnyOfParams('levels', Object.values(NekoBtLevel)),
    useOptions: useNekoBtLevelOptions,
  },
  {
    key: 'videoSource',
    type: SearchFilterType.Chips,
    param: 'source',
    title: 'torrents.filters.videoSource',
    hint: { keypath: 'torrents.filters.anyOfHint', include: 'include', exclude: 'exclude' },
    api: getAnyOfParams('video_sources', Object.values(NekoBtVideoSource)),
    useOptions: useNekoBtVideoSourceOptions,
  },
  {
    key: 'videoCodec',
    type: SearchFilterType.Chips,
    param: 'codec',
    title: 'torrents.filters.videoCodec',
    hint: { keypath: 'torrents.filters.anyOfHint', include: 'include', exclude: 'exclude' },
    api: getAnyOfParams('video_codecs', Object.values(NekoBtVideoCodec)),
    useOptions: useNekoBtVideoCodecOptions,
  },
  {
    key: 'audioLanguage',
    type: SearchFilterType.Choice,
    param: 'audio',
    title: 'torrents.filters.audioLanguage',
    api: 'audio_language',
    emptyValue: 'any',
    useOptions: useNekoBtAudioLanguageOptions,
  },
  {
    key: 'batch',
    type: SearchFilterType.Choice,
    param: 'batch',
    title: 'torrents.filters.batch',
    api: 'batch',
    emptyValue: 'any',
    useOptions: useNekoBtBatchOptions,
  },
  {
    key: 'originalTranslationOnly',
    type: SearchFilterType.Switch,
    param: 'otl',
    title: 'torrents.filters.translation',
    label: 'torrents.filters.originalTranslationOnly',
    api: { original_translation: 'true' },
  },
  {
    key: 'hideMachineTranslations',
    type: SearchFilterType.Switch,
    param: 'no_mtl',
    title: 'torrents.filters.machineTranslation',
    label: 'torrents.filters.hideMachineTranslations',
    api: { machine_translation: 'false' },
  },
  {
    key: 'hideHardsubs',
    type: SearchFilterType.Switch,
    param: 'no_hardsub',
    title: 'torrents.filters.hardsub',
    label: 'torrents.filters.hideHardsubs',
    api: { hardsub: 'false' },
  },
];
