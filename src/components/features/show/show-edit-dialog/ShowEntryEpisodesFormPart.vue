<script setup lang="ts">
import type { EpisodeFormData, ShowEntryFormData } from './ShowEntriesFormData';
import type { IDragEvent } from '@vue-dnd-kit/core';
import { makeDroppable } from '@vue-dnd-kit/core';
import { computed, useTemplateRef } from 'vue';
import SortableItem from '@/components/common/sortable-item';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { getRules } from './showEntriesFormRules';

const entry = defineModel<ShowEntryFormData>('entry', { required: true });

const episodeZoneRef = useTemplateRef<HTMLElement>('episodeZone');

const { confirm } = useConfirmDialog();

const unsavedEpisodeRenderKey = Symbol('unsavedEpisodeRenderKey');
const episodeDragGroup = `show-episode-${crypto.randomUUID()}`;

const rules = computed(() => getRules({ entries: [entry.value] }));

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

const addEpisode = (): void => {
  const episodes = (entry.value.episodes ??= []);

  episodes.push({
    name: '',
    filename: '',
    sequence_number: episodes.length,
  });
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

  entry.value.episodes?.splice(index, 1);
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
      <div class="d-flex ga-3 flex-column overflow-scroll justify-start" ref="episodeZone">
        <transition-group name="task">
          <sortable-item
            v-for="(episode, index) in entry.episodes"
            :drag-options="{ dragHandle: '.handle', groups: [episodeDragGroup] }"
            :drag-payload="() => [index, entry.episodes!]"
            class="d-flex position-relative ga-2"
            :key="getEpisodeRenderKey(episode)"
          >
            <v-sheet class="flex-1-1 pa-2 rounded-lg" border>
              <div class="d-flex ga-2 align-center mb-2">
                <v-icon class="handle cursor-grab" icon="mdi-drag-vertical" @click.stop />
                <span class="text-caption text-medium-emphasis">Episode {{ index + 1 }}</span>
              </div>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field v-model="entry.episodes![index].name" :rules="rules.episodeName" label="Episode name" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="entry.episodes![index].filename"
                    :rules="rules.episodeFilename"
                    label="Filename"
                  />
                </v-col>
              </v-row>
            </v-sheet>

            <v-btn color="error" icon="mdi-trash-can" size="x-small" @click.stop="removeEpisode(index)" />
          </sortable-item>
        </transition-group>
      </div>
    </v-col>

    <v-col cols="12">
      <v-btn size="small" variant="text" @click="addEpisode"> Add episode </v-btn>
    </v-col>
  </v-row>
</template>

<style scoped>
.task-move {
  transition: transform 0.25s;
}
</style>
