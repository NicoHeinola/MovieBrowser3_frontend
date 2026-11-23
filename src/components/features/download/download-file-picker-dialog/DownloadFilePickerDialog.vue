<script setup lang="ts">
import type { DownloadFilePickerDialogProps } from './downloadFilePickerDialogProps';
import type { DownloadFile } from '@/interfaces/api/models/DownloadFile';
import type { DownloadFileTreeNode } from '@/utils/download/getDownloadFileTree';

import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { BaseDialog } from '@/components/common/base-dialog';
import { getDownloadFileName } from '@/utils/download/getDownloadFileName';
import { getDownloadFileTree } from '@/utils/download/getDownloadFileTree';
import { formatFileSize } from '@/utils/file/formatFileSize';
import { isEpisodeVideoFile } from '@/utils/show/video-file/isEpisodeVideoFile';

const props = defineProps<DownloadFilePickerDialogProps>();

const isDialogVisible = defineModel<boolean>({ required: true });

/**
 * The picked files' indexes. For new episodes, video files start picked and extras such as fonts or subtitles don't;
 * one episode's file starts unpicked.
 */
const pickedIndexes = ref<number[]>(
  props.isSingle
    ? []
    : props.files
        .filter((file) => isEpisodeVideoFile({ name: getDownloadFileName(file.path), type: '' }))
        .map((file) => file.index),
);

const { locale, t } = useI18n();

const tree = computed<DownloadFileTreeNode[]>(() => getDownloadFileTree(props.files));

/** The picked files, in the order the tree shows them, which is the order their episodes get. */
const pickedFiles = computed<DownloadFile[]>(() => {
  const filesByIndex = new Map(props.files.map((file) => [file.index, file]));
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
      <v-alert class="flex-0-1" type="info" variant="tonal" v-if="props.files.length === 0">
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
    </template>

    <template #actions>
      <span class="text-medium-emphasis text-body-small ps-4" v-if="props.files.length > 0 && !props.isSingle">
        {{ pickedSummary }}
      </span>
      <v-spacer />
      <v-btn variant="text" @click="props.close()"> {{ t('common.cancel') }} </v-btn>
      <v-btn :disabled="pickedFiles.length === 0" color="primary" variant="flat" @click="props.close(pickedFiles)">
        {{ props.isSingle ? t('download.useFile') : t('download.addPicked') }}
      </v-btn>
    </template>
  </base-dialog>
</template>
