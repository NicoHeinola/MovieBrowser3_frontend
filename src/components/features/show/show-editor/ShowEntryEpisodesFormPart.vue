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
import { episodeVideoFileExtensions } from '@/utils/show/video-file/episodeVideoFileExtensions';
import { getEpisodeNameFromFilename } from '@/utils/show/video-file/getEpisodeNameFromFilename';
import { sortFilesByName } from '@/utils/show/video-file/sortFilesByName';
import { getUnsavedRowKey } from '@/utils/sortable/getUnsavedRowKey';
import { renumberItems } from '@/utils/sortable/renumberItems';

import ShowEpisodeExpansionPanel from './ShowEpisodeExpansionPanel.vue';

const entry = defineModel<ShowEntryFormData>('entry', { required: true });

const { moveTargets = [] } = defineProps<{
  /** The show's other entries, which an episode can move to. */
  moveTargets?: ShowEntryFormData[];
}>();

const emit = defineEmits<{
  /** The user moves an episode to another entry; the owner of all entries moves it. */
  move: [episode: EpisodeFormData, target: ShowEntryFormData];
}>();

const episodeZoneRef = useTemplateRef<HTMLElement>('episodeZone');
/**
 * Keys of the open episodes. Keys, not the episodes: saving reloads the show into new objects, and saved episodes must
 * stay open across that.
 */
const expandedEpisodeKeys = ref<string[]>([]);

const { confirm } = useConfirmDialog();
const { showSuccessSnackbar, showWarningSnackbar } = useCommonSnackbar();
const { t } = useI18n();

const syncEpisodeSequenceNumbers = (): void => {
  renumberItems(entry.value.episodes ?? [], 'sequence_number');
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

/**
 * Opens or closes episode panels.
 *
 * @param episodes The episodes.
 * @param isExpanded Whether they should be open.
 * @returns Nothing.
 */
const setEpisodesExpanded = (episodes: EpisodeFormData[], isExpanded: boolean): void => {
  const keys = new Set(episodes.map((episode) => getEpisodeRenderKey(episode)));

  expandedEpisodeKeys.value = isExpanded
    ? [...new Set([...expandedEpisodeKeys.value, ...keys])]
    : expandedEpisodeKeys.value.filter((expandedKey) => !keys.has(expandedKey));
};

const addEpisode = (): void => {
  const episodes = (entry.value.episodes ??= []);

  const nextEpisode: EpisodeFormData = {
    name: t('show.untitled'),
    sequence_number: episodes.length,
  };

  episodes.push(nextEpisode);
  setEpisodesExpanded([nextEpisode], true);
};

/** Adds episodes for picked or dropped files, skipping duplicates. */
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

  // Explorers hand over files in the order they were selected or dragged from, so order them by name first.
  for (const file of sortFilesByName(selectedFiles)) {
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
  setEpisodesExpanded(nextEpisodes, true);

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
  input.accept = episodeVideoFileExtensions.join(',');
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
    setEpisodesExpanded([removedEpisode], false);
  }

  syncEpisodeSequenceNumbers();
};

/**
 * Hands an episode to another entry. It keeps its id, so saving moves it with its file and watch progress.
 *
 * @param episode The episode.
 * @param target The entry it moves to.
 * @returns Nothing.
 */
const moveEpisode = (episode: EpisodeFormData, target: ShowEntryFormData): void => {
  setEpisodesExpanded([episode], false);
  emit('move', episode, target);
};

defineExpose({ addPickedEpisodes });

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
          :expanded="expandedEpisodeKeys.includes(getEpisodeRenderKey(episode))"
          class="overflow-hidden"
          style="flex: 1 1 auto; min-width: 0"
          @update:expanded="setEpisodesExpanded([episode], $event)"
        />
        <v-menu location="bottom end">
          <template #activator="{ props: menuProps }">
            <v-btn
              v-bind="menuProps"
              :aria-label="t('show.moveEpisode')"
              :disabled="moveTargets.length === 0"
              :title="t('show.moveEpisode')"
              class="flex-shrink-0"
              icon="mdi-folder-move-outline"
              size="x-small"
              variant="tonal"
              @click.stop
            />
          </template>

          <v-list density="compact">
            <v-list-subheader>{{ t('show.moveEpisodeTo') }}</v-list-subheader>
            <v-list-item
              v-for="(target, targetIndex) in moveTargets"
              :title="target.name"
              @click="moveEpisode(episode, target)"
              :key="targetIndex"
            />
          </v-list>
        </v-menu>
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
      <span class="text-medium-emphasis text-body-small d-flex align-center ga-2">
        <v-icon icon="mdi-file-upload-outline" size="small" />
        {{ t('show.dropEpisodeFilesHint') }}
      </span>
    </template>
  </form-item-list>
</template>
