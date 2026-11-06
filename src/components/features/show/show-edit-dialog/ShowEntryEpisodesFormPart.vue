<script setup lang="ts">
import type { EpisodeFormData } from './EpisodeFormData';
import type { ShowEntryFormData } from './ShowEntryFormData';
import { ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { FormItemList } from '@/components/common/form-item-list';
import { SortableItem } from '@/components/common/sortable-item';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useSortableItems } from '@/composables/sortable/useSortableItems';
import { getEpisodeNameFromFilename } from '@/utils/show/getEpisodeNameFromFilename';
import { getUnsavedRowKey } from '@/utils/sortable/getUnsavedRowKey';

import ShowEpisodeExpansionPanel from './ShowEpisodeExpansionPanel.vue';

const entry = defineModel<ShowEntryFormData>('entry', { required: true });

const episodeZoneRef = useTemplateRef<HTMLElement>('episodeZone');
const expandedEpisodes = ref<EpisodeFormData[]>([]);

const { confirm } = useConfirmDialog();
const { showSuccessSnackbar, showWarningSnackbar } = useCommonSnackbar();
const { t } = useI18n();

const preferredEpisodeFileExtensions = ['.mp4', '.m4v', '.mkv', '.webm', '.mov', '.avi', '.wmv', '.mpeg', '.mpg'];

const syncEpisodeSequenceNumbers = (): void => {
  for (const [index, episode] of (entry.value.episodes ?? []).entries()) {
    episode.sequence_number = index;
  }
};

/**
 * Key of an episode in the list, for both Vue and the drag library.
 *
 * @param episode The episode.
 * @returns Its key.
 */
const getEpisodeRenderKey = (episode: EpisodeFormData): string => {
  return episode.id == null ? getUnsavedRowKey(episode) : `episode-${episode.id}`;
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

const draftEpisodes = useSortableItems<EpisodeFormData>(episodeZoneRef, {
  getItems: () => entry.value.episodes ?? [],
  getKey: getEpisodeRenderKey,
  setItems: (episodes) => {
    entry.value.episodes = episodes;
    syncEpisodeSequenceNumbers();
  },
});
</script>

<template>
  <form-item-list :has-items="(entry.episodes?.length ?? 0) > 0">
    <div class="d-flex ga-2 flex-column overflow-auto justify-start" ref="episodeZone">
      <sortable-item
        v-for="episode in draftEpisodes"
        :item="episode"
        class="d-flex ga-2"
        :key="getEpisodeRenderKey(episode)"
      >
        <show-episode-expansion-panel
          :episode="episode"
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
          @click.stop="removeEpisode(entry.episodes!.indexOf(episode))"
        />
      </sortable-item>
    </div>

    <template #actions>
      <v-btn size="small" variant="text" @click="addEpisode"> {{ t('show.addEpisode') }} </v-btn>
      <v-btn size="small" variant="text" @click="addEpisodesFromFiles"> {{ t('show.addEpisodesFromFiles') }} </v-btn>
    </template>
  </form-item-list>
</template>
