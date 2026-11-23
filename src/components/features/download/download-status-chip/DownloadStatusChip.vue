<script setup lang="ts">
import type { DownloadStatus } from '@/enums/download/DownloadStatus';

import { useI18n } from 'vue-i18n';

import { DOWNLOAD_STATUS_STYLES } from '@/utils/download/downloadStatusStyles';

const props = defineProps<{
  /** The download's status, or nothing for a torrent file picked but not saved yet. */
  status?: DownloadStatus;
}>();

const { t } = useI18n();
</script>

<template>
  <v-chip
    :color="DOWNLOAD_STATUS_STYLES[props.status].color"
    :prepend-icon="DOWNLOAD_STATUS_STYLES[props.status].icon"
    class="flex-shrink-0"
    size="small"
    variant="tonal"
    v-if="props.status"
  >
    {{ t(`download.statuses.${props.status}`) }}
  </v-chip>
  <v-chip
    class="flex-shrink-0"
    color="info"
    prepend-icon="mdi-download-box-outline"
    size="small"
    variant="tonal"
    v-else
  >
    {{ t('download.downloadsOnSave') }}
  </v-chip>
</template>
