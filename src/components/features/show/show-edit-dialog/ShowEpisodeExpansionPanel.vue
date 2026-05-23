<script setup lang="ts">
import type { EpisodeFormData } from './ShowEntriesFormData';
import { computed } from 'vue';

import { getRules } from './showEntriesFormRules';

const episode = defineModel<EpisodeFormData>('episode', { required: true });
const expanded = defineModel<boolean>('expanded', { default: false });

const rules = computed(() => getRules(null));

const panelModelValue = computed<string[]>(() => {
  return expanded.value ? ['episode'] : [];
});

const episodeTitle = computed<string>(() => {
  return episode.value.name || 'Untitled episode';
});

const episodeMeta = computed<string>(() => {
  return episode.value.filename || 'No filename';
});

const updatePanelModelValue = (value: string[]): void => {
  expanded.value = value.includes('episode');
};
</script>

<template>
  <v-expansion-panels
    :model-value="panelModelValue"
    variant="accordion"
    multiple
    @update:model-value="updatePanelModelValue"
  >
    <v-expansion-panel class="rounded-lg border" value="episode">
      <template #title>
        <div class="d-flex align-center ga-2 flex-1-1-100 overflow-hidden" style="min-width: 0">
          <v-icon class="handle cursor-grab text-medium-emphasis flex-shrink-0" icon="mdi-drag-vertical" @click.stop />
          <div class="font-weight-medium text-truncate" style="flex: 1 1 auto; min-width: 0">
            {{ episodeTitle }}
          </div>
          <div
            class="text-medium-emphasis text-caption text-truncate"
            style="flex: 0 1 40%; min-width: 0; white-space: nowrap"
          >
            {{ episodeMeta }}
          </div>
        </div>
      </template>

      <template #text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="episode.name" :rules="rules.episodeName" label="Episode name" />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field v-model="episode.filename" :rules="rules.episodeFilename" label="Filename" />
          </v-col>
        </v-row>
      </template>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
