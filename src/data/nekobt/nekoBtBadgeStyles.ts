import type { NekoBtBadge } from '@/interfaces/nekobt/NekoBtBadge';

import { NekoBtLevel } from '@/enums/nekobt/NekoBtLevel';

/**
 * How every nekoBT badge looks, for the table and its help alike: the theme color of each level, source and codec
 * badge (the tokens live in the Vuetify theme), and the yes-or-no tags with their texts.
 */
export const NEKOBT_BADGE_STYLES = {
  levelColors: {
    [NekoBtLevel.Official]: 'torrent-level-official',
    [NekoBtLevel.SlightModifications]: 'torrent-level-slight-modifications',
    [NekoBtLevel.SmallScaleFansub]: 'torrent-level-small-scale-fansub',
    [NekoBtLevel.FullScaleFansub]: 'torrent-level-full-scale-fansub',
  } satisfies Record<NekoBtLevel, string>,
  /** In the order nekoBT shows them. */
  tags: {
    originalTranslation: {
      key: 'otl',
      textKey: 'torrents.originalTranslation',
      descriptionKey: 'torrents.originalTranslationHint',
      color: 'success',
    },
    machineTranslation: {
      key: 'mtl',
      textKey: 'torrents.machineTranslation',
      descriptionKey: 'torrents.machineTranslationHint',
      color: 'error',
    },
    hardsub: { key: 'hardsub', textKey: 'torrents.hardsub', descriptionKey: 'torrents.help.hardsub', color: 'warning' },
    batch: { key: 'batch', textKey: 'torrents.batch', descriptionKey: 'torrents.batchHint', color: 'primary' },
  } satisfies Record<string, NekoBtBadge>,
  videoSourceColor: 'torrent-video-source',
  videoCodecColor: 'torrent-video-codec',
} as const;
