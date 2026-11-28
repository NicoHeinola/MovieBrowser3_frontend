<script setup lang="ts">
import type { Download } from '@/interfaces/api/models/Download';
import type { DownloadProgress as DownloadProgressParts } from '@/utils/download/getDownloadProgress';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { DownloadStatus } from '@/enums/download/DownloadStatus';
import { DOWNLOAD_STATUS_STYLES } from '@/utils/download/downloadStatusStyles';
import { getDownloadProgress } from '@/utils/download/getDownloadProgress';
import { isDownloadCompleted } from '@/utils/download/isDownloadCompleted';

/**
 * How far a download got: a bar in its status's color with the percent beside it, and the bytes or files under it.
 * Show it only when `hasDownloadProgress` is true.
 */
const props = defineProps<{
  download: Download;
}>();

const { t } = useI18n();

/** Whether all its files are in place. */
const isCompleted = computed<boolean>(() => isDownloadCompleted(props.download.status));

/**
 * Its percent and bytes. A finished download's torrent leaves qBittorrent once seeded, taking its sizes with it, so it
 * simply reads as complete.
 */
const progressParts = computed<DownloadProgressParts | null>(() => {
  const parts = getDownloadProgress(props.download);

  if (isCompleted.value) {
    return parts ?? { percent: t('download.percent', { percent: 100 }), bytes: '' };
  }

  return parts;
});

/**
 * What's under the bar. Once its finished files are on their way to their episodes, all bytes are downloaded and say
 * nothing, so it's how many files arrived. Such as "3 of 25 files in place" or "1.0 GB of 4.0 GB".
 */
const progressText = computed<string>(() => {
  if (props.download.status === DownloadStatus.Importing) {
    const counts = { done: props.download.imported_file_count, count: props.download.picked_file_count };

    return t('download.filesInPlace', counts, props.download.picked_file_count);
  }

  return progressParts.value?.bytes || '–';
});
</script>

<template>
  <!-- The bar takes its status's color, stripes while data moves, and runs without an end while its size is unknown,
       so a glance tells moving, done and stuck apart -->
  <div class="d-flex flex-column">
    <div class="d-flex align-center ga-2">
      <v-progress-linear
        :color="DOWNLOAD_STATUS_STYLES[props.download.status].color"
        :indeterminate="
          (props.download.size_bytes === 0 && !isCompleted) || props.download.status === DownloadStatus.Importing
        "
        :model-value="isCompleted ? 100 : props.download.progress * 100"
        :striped="props.download.status === DownloadStatus.Downloading"
        height="8"
        rounded
      />
      <span class="text-body-small font-weight-medium text-no-wrap" v-if="progressParts">
        {{ progressParts.percent }}
      </span>
    </div>
    <span class="text-medium-emphasis text-body-small">{{ progressText }}</span>
  </div>
</template>
