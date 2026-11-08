<script setup lang="ts">
import type { ShowEntryFormData } from './ShowEntryFormData';
import { useDropZone } from '@vueuse/core';
import { computed, ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatFileSize } from '@/utils/file/formatFileSize';
import { getEntryVideoBytes } from '@/utils/show/getEntryVideoBytes';
import { isEpisodeVideoFile } from '@/utils/show/isEpisodeVideoFile';
import ShowEntryEpisodesFormPart from './ShowEntryEpisodesFormPart.vue';
import ShowEntryGeneralFormPart from './ShowEntryGeneralFormPart.vue';

const { t, locale } = useI18n();

const entry = defineModel<ShowEntryFormData>('entry', { required: true });
const expanded = defineModel<boolean>('expanded', { default: false });

const selectedTab = ref<string>('general');
const episodesPart = useTemplateRef<InstanceType<typeof ShowEntryEpisodesFormPart>>('episodesPart');
const dropZone = useTemplateRef<HTMLElement>('dropZone');

// No dataTypes filter: VueUse compares MIME types there, and the browser reports none for files like .mkv.
// Native file drags from outside the page are not covered by the sortable library, so VueUse handles them.
// The episodes part is eager, so it is mounted even while the panel is collapsed.
const { isOverDropZone } = useDropZone(dropZone, {
  multiple: true,
  preventDefaultForUnhandled: true,
  onDrop: (files) => {
    episodesPart.value?.addPickedEpisodes((files ?? []).filter((file) => isEpisodeVideoFile(file)));
  },
});

/** The entry's measured video files, shown beside its episode count. */
const videoBytes = computed<number>(() => getEntryVideoBytes(entry.value));

const panelModelValue = computed<string[]>(() => {
  return expanded.value ? ['entry'] : [];
});

const updatePanelModelValue = (value: string[]): void => {
  expanded.value = value.includes('entry');
};
</script>

<template>
  <v-expansion-panels
    :model-value="panelModelValue"
    variant="accordion"
    multiple
    @update:model-value="updatePanelModelValue"
  >
    <v-expansion-panel class="rounded-lg border position-relative" value="entry" eager ref="dropZone">
      <v-fade-transition>
        <div
          :class="[
            'position-absolute top-0 left-0 w-100 h-100 pointer-events-none',
            'd-flex align-center justify-center ga-2 text-primary',
            'border-md border-dashed border-primary border-opacity-100 rounded-lg',
          ]"
          style="z-index: 2; background: rgba(var(--v-theme-primary), 0.12)"
          v-if="isOverDropZone"
        >
          <v-icon icon="mdi-file-upload-outline" />
          <span class="font-weight-medium">{{ t('show.dropEpisodeFiles') }}</span>
        </div>
      </v-fade-transition>

      <template #title>
        <div class="d-flex align-center ga-2 flex-1-1-100 overflow-hidden">
          <v-icon class="handle cursor-grab text-medium-emphasis" icon="mdi-drag-vertical" @click.stop />
          <span class="font-weight-medium text-truncate" style="flex: 1 1 auto; min-width: 0">
            {{ entry.name }}
          </span>
          <span class="text-medium-emphasis text-body-small text-no-wrap" v-if="videoBytes > 0">
            {{ formatFileSize(videoBytes, locale) }}
          </span>
          <span class="text-medium-emphasis text-body-small text-no-wrap">{{
            t('show.episodeCount', { count: entry.episodes?.length ?? 0 })
          }}</span>
        </div>
      </template>

      <template #text>
        <v-row>
          <v-col cols="12">
            <v-tabs v-model="selectedTab" color="primary">
              <v-tab :text="t('show.tabGeneral')" value="general" />
              <v-tab :text="t('show.episodes')" value="episodes" />
            </v-tabs>
          </v-col>

          <v-col cols="12">
            <v-tabs-window :model-value="selectedTab">
              <v-tabs-window-item class="pa-2" value="general" eager>
                <show-entry-general-form-part v-model:entry="entry" />
              </v-tabs-window-item>

              <v-tabs-window-item class="pa-2" value="episodes" eager>
                <show-entry-episodes-form-part v-model:entry="entry" ref="episodesPart" />
              </v-tabs-window-item>
            </v-tabs-window>
          </v-col>
        </v-row>
      </template>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
