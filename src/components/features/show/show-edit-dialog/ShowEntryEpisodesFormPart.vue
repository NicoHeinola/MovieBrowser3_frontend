<script setup lang="ts">
import type { EpisodeFormData, ShowEntryFormData } from './ShowEntriesFormData';
import type { IDragEvent } from '@vue-dnd-kit/core';
import { makeDroppable } from '@vue-dnd-kit/core';
import { ref, useTemplateRef } from 'vue';

import SortableItem from '@/components/common/sortable-item';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';

import ShowEpisodeExpansionPanel from './ShowEpisodeExpansionPanel.vue';

const entry = defineModel<ShowEntryFormData>('entry', { required: true });

const episodeZoneRef = useTemplateRef<HTMLElement>('episodeZone');
const expandedEpisodes = ref<EpisodeFormData[]>([]);

const { confirm } = useConfirmDialog();

const unsavedEpisodeRenderKey = Symbol('unsavedEpisodeRenderKey');
const episodeDragGroup = `show-episode-${crypto.randomUUID()}`;

const syncEpisodeSequenceNumbers = (): void => {
  for (const [index, episode] of (entry.value.episodes ?? []).entries()) {
    episode.sequence_number = index;
  }
};

const getEpisodeRenderKey = (episode: EpisodeFormData): string | symbol => {
  if (episode.id != null) {
    return `episode-${episode.id}`;
  }

  const localEpisode = episode as EpisodeFormData & { [unsavedEpisodeRenderKey]?: symbol };

  localEpisode[unsavedEpisodeRenderKey] ??= Symbol('episode');

  return localEpisode[unsavedEpisodeRenderKey];
};

const setEpisodeExpanded = (episode: EpisodeFormData, isExpanded: boolean): void => {
  if (isExpanded) {
    expandedEpisodes.value = [...new Set([...expandedEpisodes.value, episode])];
    return;
  }

  expandedEpisodes.value = expandedEpisodes.value.filter((expandedEpisode) => expandedEpisode !== episode);
};

const addEpisode = (): void => {
  const episodes = (entry.value.episodes ??= []);

  const nextEpisode: EpisodeFormData = {
    name: 'Untitled',
    filename: '',
    sequence_number: episodes.length,
  };

  episodes.push(nextEpisode);
  setEpisodeExpanded(nextEpisode, true);
};

const removeEpisode = async (index: number): Promise<void> => {
  const episodeName = entry.value.episodes?.[index]?.name;
  const isConfirmed = await confirm({
    message: `Are you sure you want to remove "${episodeName}"?`,
    confirmColor: 'error',
    confirmText: 'Remove',
  });

  if (!isConfirmed) {
    return;
  }

  const removedEpisode = entry.value.episodes?.[index];
  entry.value.episodes?.splice(index, 1);

  if (removedEpisode) {
    setEpisodeExpanded(removedEpisode, false);
  }

  syncEpisodeSequenceNumbers();
};

makeDroppable(
  episodeZoneRef,
  {
    groups: [episodeDragGroup],
    events: {
      onDrop(e: IDragEvent) {
        const suggestedSort = e.helpers.suggestSort('vertical');
        if (suggestedSort == null) {
          return;
        }

        entry.value.episodes = suggestedSort.sourceItems as EpisodeFormData[];
        syncEpisodeSequenceNumbers();
      },
    },
  },
  () => entry.value.episodes ?? [],
);
</script>

<template>
  <v-row gap="0">
    <v-col cols="12">
      <div class="d-flex ga-2 flex-column overflow-scroll justify-start" ref="episodeZone">
        <transition-group name="task">
          <sortable-item
            v-for="(episode, index) in entry.episodes"
            :drag-options="{ dragHandle: '.handle', groups: [episodeDragGroup] }"
            :drag-payload="() => [index, entry.episodes!]"
            class="d-flex ga-2"
            :key="getEpisodeRenderKey(episode)"
          >
            <show-episode-expansion-panel
              v-model:episode="entry.episodes![index]"
              :expanded="expandedEpisodes.includes(episode)"
              class="overflow-hidden"
              style="flex: 1 1 auto; min-width: 0"
              @update:expanded="setEpisodeExpanded(episode, $event)"
            />
            <v-btn
              class="flex-shrink-0"
              color="error"
              icon="mdi-trash-can"
              size="x-small"
              @click.stop="removeEpisode(index)"
            />
          </sortable-item>
        </transition-group>
      </div>
    </v-col>

    <v-col cols="12">
      <v-btn size="small" variant="text" @click="addEpisode"> Add another episode </v-btn>
    </v-col>
  </v-row>
</template>

<style scoped>
.task-move {
  transition: transform 0.25s;
}
</style>
