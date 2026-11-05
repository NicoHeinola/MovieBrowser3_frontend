<script setup lang="ts">
import type { EpisodeFormData } from './EpisodeFormData';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { MissingVideoFileChip } from '@/components/features/show/missing-video-file-chip';
import { isEpisodeVideoMissing } from '@/utils/show/isEpisodeVideoMissing';

import { getRules } from './showEntriesFormRules';

const { t } = useI18n();

const episode = defineModel<EpisodeFormData>('episode', { required: true });
const expanded = defineModel<boolean>('expanded', { default: false });

const rules = computed(() => getRules(null));

/** The picked file's name, or the saved one. An unsaved episode's filename is only left over from a cleared pick. */
const filename = computed<string | undefined>(() => {
  return episode.value.file?.name || (episode.value.id ? episode.value.filename : undefined);
});

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
          <span class="text-medium-emphasis text-body-small">{{ episode.sequence_number + 1 }}</span>
          <span class="font-weight-medium text-truncate" style="flex: 1 1 auto; min-width: 0">
            {{ episode.name }}
          </span>
          <span
            class="text-medium-emphasis text-body-small text-truncate"
            style="max-width: 40%; min-width: 0"
            v-if="filename"
          >
            {{ filename }}
          </span>
          <missing-video-file-chip v-if="isEpisodeVideoMissing(episode)" />
        </div>
      </template>

      <template #text>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="episode.name"
              :label="t('show.episodeName')"
              :rules="rules.episodeName"
              class="required"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-file-input v-model="episode.file" :label="t('show.file')" :rules="rules.episodeFile" />
          </v-col>
        </v-row>
      </template>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
