<script setup lang="ts">
import type { ShowEntryFormData } from './ShowEntriesFormData';
import { computed, ref } from 'vue';
import ShowEntryEpisodesFormPart from './ShowEntryEpisodesFormPart.vue';
import ShowEntryGeneralFormPart from './ShowEntryGeneralFormPart.vue';

const entry = defineModel<ShowEntryFormData>('entry', { required: true });
const expanded = defineModel<boolean>('expanded', { default: false });

const selectedTab = ref<string>('general');

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
    <v-expansion-panel class="rounded-lg border" value="entry">
      <template #title>
        <div class="d-flex align-center ga-2 flex-1-1-100 overflow-hidden">
          <v-icon class="handle cursor-grab text-medium-emphasis" icon="mdi-drag-vertical" @click.stop />
          <span class="font-weight-medium text-truncate">{{ entry.name }}</span>
          <v-spacer />
          <span class="text-medium-emphasis text-caption text-no-wrap mr-2"
            >{{ entry.episodes?.length ?? 0 }} Episodes</span
          >
        </div>
      </template>

      <template #text>
        <v-row>
          <v-col cols="12">
            <v-tabs v-model="selectedTab" color="primary">
              <v-tab text="General" value="general" />
              <v-tab text="Episodes" value="episodes" />
            </v-tabs>
          </v-col>

          <v-col cols="12">
            <v-tabs-window :model-value="selectedTab">
              <v-tabs-window-item class="pa-1" value="general">
                <show-entry-general-form-part v-model:entry="entry" />
              </v-tabs-window-item>

              <v-tabs-window-item class="pa-1" value="episodes">
                <show-entry-episodes-form-part v-model:entry="entry" />
              </v-tabs-window-item>
            </v-tabs-window>
          </v-col>
        </v-row>
      </template>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
