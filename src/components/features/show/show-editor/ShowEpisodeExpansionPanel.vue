<script setup lang="ts">
import type { EpisodeFormData } from './EpisodeFormData';
import type {
  DownloadFilePickerInput,
  PickedDownloadFiles,
} from '@/components/features/download/download-file-picker-dialog';
import type { DownloadStatus } from '@/enums/download/DownloadStatus';
import type { ComponentPublicInstance } from 'vue';
import { makeDroppable } from '@vue-dnd-kit/core';
import { computed, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { DownloadFilePickerDialog } from '@/components/features/download/download-file-picker-dialog';
import { DownloadStatusChip } from '@/components/features/download/download-status-chip';
import { MissingVideoFileChip } from '@/components/features/show/missing-video-file-chip';
import { useDialog } from '@/components/layouts/dialog-provider';
import { getDownloadFileName } from '@/utils/download/getDownloadFileName';
import { getDownloadFileStatus } from '@/utils/download/getDownloadFileStatus';
import { formatFileSize } from '@/utils/file/formatFileSize';
import { isEpisodeVideoMissing } from '@/utils/show/video-file/isEpisodeVideoMissing';
import { formatDuration } from '@/utils/time/formatDuration';

import { injectShowEditorDownloads } from './injectShowEditorDownloads';
import { getRules } from './showEntriesFormRules';

const { t, locale } = useI18n();

const episode = defineModel<EpisodeFormData>('episode', { required: true });
const expanded = defineModel<boolean>('expanded', { default: false });

const fileInput = useTemplateRef<ComponentPublicInstance>('fileInput');

const dialog = useDialog();
const editorDownloads = injectShowEditorDownloads();

const rules = computed(() => getRules(null));

/** Whether the episode's video comes from a torrent file that isn't in place yet. */
const isWaitingForDownload = computed<boolean>(
  () => !episode.value.file && Boolean(episode.value.download) && !episode.value.download?.imported_at,
);

/**
 * Where the episode's file stands: its own progress while the editor follows its torrent (each file finishes and is
 * copied on its own), otherwise the saved download status. An unsaved pick has none yet.
 */
const downloadStatus = computed<DownloadStatus | undefined>(() => {
  const pick = episode.value.download;
  const download = editorDownloads.value.torrents.find((torrent) => torrent.download.id === pick?.id)?.download;
  // Only a saved pick has its file claimed for this episode
  const file = download?.files?.find((item) => item.index === pick?.file_index && item.episode_id === episode.value.id);

  return download && file ? getDownloadFileStatus(download, file) : pick?.status;
});

/**
 * The picked file's name, the torrent file's, or the saved one. An unsaved episode's filename is only left over from a
 * cleared pick.
 */
const filename = computed<string | undefined>(() => {
  if (isWaitingForDownload.value) {
    return getDownloadFileName(episode.value.download!.path);
  }

  return episode.value.file?.name || (episode.value.id ? episode.value.filename : undefined);
});

/**
 * Lets the user pick one torrent file for the episode, which downloads into it once the show is saved. A video it
 * already has is replaced when the download is done.
 * @returns Nothing.
 */
const pickDownloadFile = async (): Promise<void> => {
  const picked = await dialog.showDialog<PickedDownloadFiles, DownloadFilePickerInput>({
    component: DownloadFilePickerDialog,
    props: { sources: editorDownloads.value.pickable, targetName: episode.value.name, isSingle: true },
  });
  const file = picked?.files[0];

  if (picked && file) {
    episode.value.download = { id: picked.download.id, file_index: file.index, path: file.path };
    // The torrent file takes the place of a picked one, which would otherwise upload too
    episode.value.file = undefined;
  }
};

/**
 * Drops the torrent file, so it isn't downloaded for this episode once the show is saved.
 * @returns Nothing.
 */
const removeDownload = (): void => {
  episode.value.download = null;
};

const panelModelValue = computed<string[]>(() => {
  return expanded.value ? ['episode'] : [];
});

const updatePanelModelValue = (value: string[]): void => {
  expanded.value = value.includes('episode');
};

// A file dropped on the file input is this episode's file, which the input sets itself. As the innermost drop target
// it takes the drop from the entry around it, which would add the file as a new episode, and hides its drop hint.
makeDroppable(() => fileInput.value?.$el as HTMLElement | undefined, {
  accept: (context) => context.active.external !== undefined,
  external: { files: true },
});
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
          <span class="text-medium-emphasis text-body-small text-no-wrap" v-if="episode.video_duration_seconds">
            {{ formatDuration(episode.video_duration_seconds) }}
          </span>
          <span class="text-medium-emphasis text-body-small text-no-wrap" v-if="episode.video_file_size">
            {{ formatFileSize(episode.video_file_size, locale) }}
          </span>
          <download-status-chip :status="downloadStatus" v-if="isWaitingForDownload" />
          <missing-video-file-chip v-else-if="isEpisodeVideoMissing(episode)" />
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
            <div class="d-flex ga-2 align-center" v-if="isWaitingForDownload">
              <v-text-field
                :label="t('download.fromTorrent')"
                :model-value="episode.download?.path"
                prepend-icon="mdi-magnet"
                disabled
              />
              <v-btn
                icon="mdi-close"
                size="small"
                variant="text"
                @click="removeDownload"
                v-tooltip:bottom="t('download.removePick')"
              />
            </div>
            <div class="d-flex ga-2 align-center" v-else>
              <v-file-input v-model="episode.file" :label="t('show.file')" :rules="rules.episodeFile" ref="fileInput" />
              <!-- Any episode can take a torrent file instead, such as a better release of a video it has -->
              <v-btn
                icon="mdi-magnet"
                size="small"
                variant="text"
                @click="void pickDownloadFile()"
                v-tooltip:bottom="t('download.pickFromTorrent')"
                v-if="editorDownloads.pickable.length > 0"
              />
            </div>
          </v-col>
        </v-row>
      </template>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
