<script setup lang="ts">
import type { DownloadFilePickerDialogProps } from './downloadFilePickerDialogProps';
import type { DownloadFile } from '@/interfaces/api/models/DownloadFile';
import type { DownloadFileTreeNode } from '@/utils/download/getDownloadFileTree';

import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { BaseDialog } from '@/components/common/base-dialog';
import { getDownloadFileName } from '@/utils/download/getDownloadFileName';
import { getDownloadFileTree } from '@/utils/download/getDownloadFileTree';
import { formatFileSize } from '@/utils/file/formatFileSize';
import { isEpisodeVideoFile } from '@/utils/show/video-file/isEpisodeVideoFile';

const props = defineProps<DownloadFilePickerDialogProps>();

const isDialogVisible = defineModel<boolean>({ required: true });

/** The torrent whose files show, the first one at the start. */
const sourceId = ref<number | undefined>(props.sources[0]?.download.id);

const source = computed(() => props.sources.find((item) => item.download.id === sourceId.value) ?? props.sources[0]);

/** The shown torrent's files still free to pick. */
const files = computed<DownloadFile[]>(() => source.value?.availableFiles ?? []);

/**
 * The picks a torrent starts with: for new episodes its video files, not extras such as fonts or subtitles; for one
 * episode none.
 * @returns The file indexes.
 */
const getStartingPicks = (): number[] =>
  props.isSingle
    ? []
    : files.value
        .filter((file) => isEpisodeVideoFile({ name: getDownloadFileName(file.path), type: '' }))
        .map((file) => file.index);

/** The picked files' indexes, in the shown torrent. */
const pickedIndexes = ref<number[]>(getStartingPicks());

// Picks belong to one torrent, so switching starts over with the new one's
watch(sourceId, () => {
  pickedIndexes.value = getStartingPicks();
});

const { locale, t } = useI18n();

const tree = computed<DownloadFileTreeNode[]>(() => getDownloadFileTree(files.value));

/** The picked files, in the order the tree shows them, which is the order their episodes get. */
const pickedFiles = computed<DownloadFile[]>(() => {
  const filesByIndex = new Map(files.value.map((file) => [file.index, file]));
  const picked = new Set(pickedIndexes.value);

  /**
   * Collects the picked files under some rows, top to bottom.
   * @param nodes - The rows.
   * @returns The picked files among them.
   */
  const collect = (nodes: DownloadFileTreeNode[]): DownloadFile[] =>
    nodes.flatMap((node) => {
      if (node.children) {
        return collect(node.children);
      }

      return picked.has(node.id as number) ? [filesByIndex.get(node.id as number)!] : [];
    });

  return collect(tree.value);
});

/**
 * Closes with the picked files and the torrent they're from.
 * @returns Nothing.
 */
const closeWithPicks = (): void => {
  props.close({ download: source.value!.download, files: pickedFiles.value });
};

/** How many files are picked and how big they are together. */
const pickedSummary = computed<string>(() => {
  const count = pickedFiles.value.length;
  const bytes = pickedFiles.value.reduce((total, file) => total + file.size_bytes, 0);

  return t('download.pickedSummary', { count, size: formatFileSize(bytes, locale.value) }, count);
});
</script>

<template>
  <base-dialog v-model="isDialogVisible" max-width="760px">
    <template #title>
      {{ t(props.isSingle ? 'download.pickFileTitle' : 'download.pickFilesTitle', { target: props.targetName }) }}
    </template>

    <template #default>
      <div class="d-flex flex-column ga-2">
        <!-- Each torrent's files stay apart: picks come from one at a time -->
        <v-select
          v-model="sourceId"
          :items="props.sources"
          :label="t('download.torrent')"
          class="flex-0-0"
          item-title="download.name"
          item-value="download.id"
          hide-details
          v-if="props.sources.length > 1"
        />

        <v-alert class="flex-0-1" type="info" variant="tonal" v-if="files.length === 0">
          {{ t('download.noFilesLeft') }}
        </v-alert>

        <v-treeview
          v-model:selected="pickedIndexes"
          :items="tree"
          :select-strategy="props.isSingle ? 'single-leaf' : 'classic'"
          density="compact"
          item-title="title"
          item-value="id"
          open-all
          selectable
          v-else
        >
          <template #prepend="{ item }">
            <v-icon :icon="item.children ? 'mdi-folder-outline' : 'mdi-file-video-outline'" size="small" />
          </template>
          <template #append="{ item }">
            <span class="text-medium-emphasis text-body-small text-no-wrap">
              {{ formatFileSize(item.sizeBytes, locale) }}
            </span>
          </template>
        </v-treeview>
      </div>
    </template>

    <template #actions>
      <span class="text-medium-emphasis text-body-small ps-4" v-if="files.length > 0 && !props.isSingle">
        {{ pickedSummary }}
      </span>
      <v-spacer />
      <v-btn variant="text" @click="props.close()"> {{ t('common.cancel') }} </v-btn>
      <v-btn :disabled="pickedFiles.length === 0" color="primary" variant="flat" @click="closeWithPicks">
        {{ props.isSingle ? t('download.useFile') : t('download.addPicked') }}
      </v-btn>
    </template>
  </base-dialog>
</template>
