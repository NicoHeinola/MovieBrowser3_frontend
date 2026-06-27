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
        <div class="d-flex align-center ga-2 flex-1-1-100 overflow-hidden">
          <v-icon class="handle cursor-grab text-medium-emphasis" icon="mdi-drag-vertical" @click.stop />
          <span class="font-weight-medium text-truncate" style="flex: 1 1 auto; min-width: 0">
            {{ episode.name }}
          </span>
          <span class="text-medium-emphasis text-caption text-truncate" style="max-width: 40%; min-width: 0">
            {{ episode.file?.name }}
          </span>
        </div>
      </template>

      <template #text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="episode.name" :rules="rules.episodeName" class="required" label="Episode name" />
          </v-col>

          <v-col cols="12" md="6">
            <v-file-input v-model="episode.file" :rules="rules.episodeFile" label="File" />
          </v-col>
        </v-row>
      </template>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
