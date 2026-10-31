<script setup lang="ts">
import type { Website } from '@/interfaces/api/models/Website';

import { useClipboard } from '@vueuse/core';
import { computed } from 'vue';

import { ExpandableText } from '@/components/common/expandable-text';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { getWebsiteDisplayName } from '@/utils/website/getWebsiteDisplayName';
import { getWebsiteHostname } from '@/utils/website/getWebsiteHostname';
import { WebsiteIcon } from '../website-icon';

const props = defineProps<{
  website: Website;
  /** Tag ids the page filters on, highlighted on the card. Excluded tags never reach a shown card. */
  includedTagIds?: number[];
}>();

const emit = defineEmits<{
  edit: [website: Website];
  'click:tag': [tagId: number];
}>();

const { copy } = useClipboard({ legacy: true });
const { showErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();

const displayName = computed<string>(() => getWebsiteDisplayName(props.website));
const hostname = computed<string>(() => getWebsiteHostname(props.website.url));

/**
 * Copies the website URL to the clipboard.
 * @returns Nothing.
 */
const copyUrl = async (): Promise<void> => {
  try {
    await copy(props.website.url);
    showSuccessSnackbar('URL copied to clipboard.');
  } catch {
    showErrorSnackbar('Could not copy the URL.');
  }
};
</script>

<template>
  <v-card class="d-flex flex-column h-100">
    <v-card-item>
      <template #prepend>
        <website-icon :icon="props.website.icon" :url="props.website.url" />
      </template>

      <v-card-title class="text-truncate">
        <a :href="props.website.url" class="link" rel="noopener noreferrer" target="_blank">
          {{ displayName }}
        </a>
        <v-tooltip activator="parent" location="top">{{ props.website.url }}</v-tooltip>
      </v-card-title>
      <v-card-subtitle>{{ hostname }}</v-card-subtitle>

      <template #append>
        <v-btn
          icon="mdi-pencil"
          size="small"
          variant="text"
          @click="emit('edit', props.website)"
          v-tooltip:bottom="'Edit'"
        />
      </template>
    </v-card-item>

    <v-card-text class="text-medium-emphasis pb-0" v-if="props.website.description">
      <expandable-text :max-chars="150" :text="props.website.description" />
    </v-card-text>

    <v-spacer />

    <v-card-actions class="align-end ga-2 px-4 pb-3">
      <div class="d-flex flex-wrap ga-1 flex-1-1">
        <v-chip
          v-for="tag in props.website.tags"
          :color="props.includedTagIds?.includes(tag.id) ? 'primary' : undefined"
          size="small"
          label
          @click="emit('click:tag', tag.id)"
          :key="tag.id"
        >
          {{ tag.name }}
        </v-chip>
      </div>
      <v-btn icon="mdi-content-copy" size="small" variant="text" @click="copyUrl" v-tooltip:bottom="'Copy URL'" />
    </v-card-actions>
  </v-card>
</template>
