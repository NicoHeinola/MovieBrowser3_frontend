<script setup lang="ts">
import type { NekoBtBadge as NekoBtBadgeStyle } from '@/interfaces/nekobt/NekoBtBadge';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { CollapsibleSection } from '@/components/common/collapsible-section';
import { NEKOBT_BADGE_STYLES } from '@/data/nekobt/nekoBtBadgeStyles';
import { NekoBtLevel } from '@/enums/nekobt/NekoBtLevel';
import { NekoBtVideoCodec } from '@/enums/nekobt/NekoBtVideoCodec';
import { NekoBtVideoSource } from '@/enums/nekobt/NekoBtVideoSource';
import { NekoBtBadge } from '../nekobt-badge';

/** A one-time lookup, so it starts closed and stays out of the way. */
const isOpen = ref<boolean>(false);

const { t } = useI18n();

/** Every badge the table can show, grouped, each with what it means; the tags explain themselves with their hint. */
const groups = computed<{ titleKey: string; badges: (NekoBtBadgeStyle & { descriptionKey: string })[] }[]>(() => {
  const { levelColors, tags, videoSourceColor, videoCodecColor } = NEKOBT_BADGE_STYLES;

  return [
    {
      titleKey: 'torrents.help.levels',
      badges: Object.values(NekoBtLevel).map((level) => ({
        key: level,
        textKey: `torrents.level.${level}`,
        color: levelColors[level],
        descriptionKey: `torrents.help.level.${level}`,
      })),
    },
    {
      titleKey: 'torrents.help.tags',
      badges: Object.values(tags).map((tag) => ({ ...tag, descriptionKey: tag.hintKey })),
    },
    {
      titleKey: 'torrents.help.videoSources',
      badges: Object.values(NekoBtVideoSource).map((source) => ({
        key: source,
        textKey: `torrents.videoSource.${source}`,
        color: videoSourceColor,
        descriptionKey: `torrents.help.videoSource.${source}`,
      })),
    },
    {
      titleKey: 'torrents.help.videoCodecs',
      badges: Object.values(NekoBtVideoCodec).map((codec) => ({
        key: codec,
        textKey: `torrents.videoCodec.${codec}`,
        color: videoCodecColor,
        descriptionKey: `torrents.help.videoCodec.${codec}`,
      })),
    },
  ];
});
</script>

<template>
  <!-- The section's body is a row already, so the groups are its columns. -->
  <collapsible-section v-model="isOpen" :title="t('torrents.help.title')">
    <v-col v-for="group in groups" class="d-flex flex-column ga-2" cols="12" lg="3" md="6" :key="group.titleKey">
      <p class="text-label-large font-weight-bold">{{ t(group.titleKey) }}</p>
      <div v-for="badge in group.badges" class="d-flex align-baseline ga-2" :key="badge.key">
        <neko-bt-badge :badge="badge" :show-hint="false" />
        <span class="text-body-small text-medium-emphasis">{{ t(badge.descriptionKey) }}</span>
      </div>
    </v-col>
  </collapsible-section>
</template>
