<script setup lang="ts">
import { computed } from 'vue';

import { WebsiteIconKind } from '@/enums/website/WebsiteIconKind';
import { getWebsiteFaviconUrl } from '@/utils/website/getWebsiteFaviconUrl';
import { getWebsiteIconKind } from '@/utils/website/getWebsiteIconKind';

const props = withDefaults(
  defineProps<{
    /** Saved icon value: an `mdi-*` name, an image URL, or null for the site's favicon. */
    icon: string | null;
    /** Website URL, used to find the favicon. */
    url: string;
    size?: number;
  }>(),
  {
    size: 40,
  },
);

const iconKind = computed<WebsiteIconKind>(() => getWebsiteIconKind(props.icon));
const innerSize = computed<number>(() => Math.round(props.size * 0.6));

const imageSrc = computed<string | null>(() => {
  if (iconKind.value === WebsiteIconKind.Image) {
    return props.icon?.trim() ?? null;
  }

  return getWebsiteFaviconUrl(props.url);
});
</script>

<template>
  <v-avatar :size="props.size" color="background" rounded="lg">
    <v-icon :icon="props.icon ?? undefined" :size="innerSize" v-if="iconKind === WebsiteIconKind.Mdi" />
    <v-img :height="innerSize" :src="imageSrc" :width="innerSize" v-else-if="imageSrc">
      <template #placeholder>
        <v-icon :size="innerSize" icon="mdi-web" />
      </template>
      <template #error>
        <v-icon :size="innerSize" icon="mdi-web" />
      </template>
    </v-img>
    <v-icon :size="innerSize" icon="mdi-web" v-else />
  </v-avatar>
</template>
