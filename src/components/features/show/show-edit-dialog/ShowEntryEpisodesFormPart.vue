<script setup lang="ts">
import type { EpisodeFormData } from './EpisodeFormData';
import type { ShowEntryFormData } from './ShowEntryFormData';
import { makeDroppable } from '@vue-dnd-kit/core';
import { ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { FormItemList } from '@/components/common/form-item-list';
import { SortableItem } from '@/components/common/sortable-item';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { getEpisodeNameFromFilename } from '@/utils/show/getEpisodeNameFromFilename';

import ShowEpisodeExpansionPanel from './ShowEpisodeExpansionPanel.vue';

const entry = defineModel<ShowEntryFormData>('entry', { required: true });

const episodeZoneRef = useTemplateRef<HTMLElement>('episodeZone');
const expandedEpisodes = ref<EpisodeFormData[]>([]);

const { confirm } = useConfirmDialog();
const { showSuccessSnackbar, showWarningSnackbar } = useCommonSnackbar();
const { t } = useI18n();

const preferredEpisodeFileExtensions = ['.mp4', '.m4v', '.mkv', '.webm', '.mov', '.avi', '.wmv', '.mpeg', '.mpg'];

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
    name: t('show.untitled'),
    sequence_number: episodes.length,
  };

  episodes.push(nextEpisode);
  setEpisodeExpanded(nextEpisode, true);
};

const addPickedEpisodes = (selectedFiles: File[]): void => {
  if (selectedFiles.length === 0) {
    return;
  }

  const episodes = (entry.value.episodes ??= []);
  const existingFilenames = new Set(
    episodes
      .map((episode) => episode.file?.name ?? episode.filename)
      .filter((filename): filename is string => filename != null),
  );
  const duplicateFilenames: string[] = [];
  const nextEpisodes: EpisodeFormData[] = [];

  for (const file of selectedFiles) {
    if (existingFilenames.has(file.name)) {
      duplicateFilenames.push(file.name);
      continue;
    }

    existingFilenames.add(file.name);

    nextEpisodes.push({
      name: getEpisodeNameFromFilename(file.name),
      file,
      filename: file.name,
      sequence_number: episodes.length + nextEpisodes.length,
    });
  }

  if (nextEpisodes.length === 0) {
    showWarningSnackbar(t('show.noEpisodesAdded', { names: duplicateFilenames.join(', ') }));
    return;
  }

  episodes.push(...nextEpisodes);
  expandedEpisodes.value = [...new Set([...expandedEpisodes.value, ...nextEpisodes])];

  if (duplicateFilenames.length > 0) {
    showWarningSnackbar(
      t('show.episodesAddedSkipped', { count: nextEpisodes.length, names: duplicateFilenames.join(', ') }),
    );
    return;
  }

  showSuccessSnackbar(t('show.episodesAdded', { count: nextEpisodes.length }));
};

const addEpisodesFromFilesWithInput = (): void => {
  const input = document.createElement('input');

  input.type = 'file';
  input.accept = preferredEpisodeFileExtensions.join(',');
  input.multiple = true;
  input.style.display = 'none';

  input.addEventListener(
    'change',
    () => {
      const selectedFiles = Array.from(input.files ?? []);

      input.remove();

      addPickedEpisodes(selectedFiles);
    },
    { once: true },
  );

  document.body.append(input);
  input.click();
};

const addEpisodesFromFiles = async (): Promise<void> => {
  addEpisodesFromFilesWithInput();
};

const removeEpisode = async (index: number): Promise<void> => {
  const episodeName = entry.value.episodes?.[index]?.name;
  const isConfirmed = await confirm({
    message: t('show.removeEntryConfirm', { name: episodeName }),
    confirmColor: 'error',
    confirmText: t('common.remove'),
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
  },
  () => entry.value.episodes ?? [],
);
</script>

<template>
  <form-item-list :has-items="(entry.episodes?.length ?? 0) > 0">
    <div class="d-flex ga-2 flex-column overflow-auto justify-start" ref="episodeZone">
      <transition-group name="task">
        <sortable-item
          v-for="(episode, index) in entry.episodes"
          :drag-options="{ dragHandle: '.handle', groups: [episodeDragGroup] }"
          :drag-payload="() => [index, entry.episodes!]"
          class="d-flex ga-2"
          @sorted="syncEpisodeSequenceNumbers"
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

    <template #actions>
      <v-btn size="small" variant="text" @click="addEpisode"> {{ t('show.addEpisode') }} </v-btn>
      <v-btn size="small" variant="text" @click="addEpisodesFromFiles"> {{ t('show.addEpisodesFromFiles') }} </v-btn>
    </template>
  </form-item-list>
</template>

<style scoped>
.task-move {
  transition: transform 0.25s;
}
</style>
