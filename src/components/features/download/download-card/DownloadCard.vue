<script setup lang="ts">
import { computed } from 'vue';

import { IconCard } from '@/components/common/icon-card';
import { DownloadStatusChip } from '@/components/features/download/download-status-chip';
import { DownloadStatus } from '@/enums/download/DownloadStatus';

/** A torrent as a card: a magnet tile, its name with details under it, and its status when it has one. */
const props = defineProps<{
  name: string;
  /** Under the name, such as its size, or its show and progress. */
  details?: string;
  /** Left out for a torrent that isn't a download yet. */
  status?: DownloadStatus;
  /** Keeps the name on one line, with the full name in a tooltip, for a card in a page rather than a dialog. */
  isOneLine?: boolean;
}>();

defineSlots<{
  /** Buttons after the status, such as cancel. */
  actions?: () => unknown;
  /** Under the row, such as its progress. */
  default?: () => unknown;
}>();

const isFailed = computed<boolean>(() => props.status === DownloadStatus.Failed);
</script>

<template>
  <icon-card
    :color="isFailed ? 'error' : 'primary'"
    :is-one-line="props.isOneLine"
    :text="props.details"
    :title="props.name"
    icon="mdi-magnet"
  >
    <template #append v-if="props.status || $slots.actions">
      <download-status-chip :status="props.status" v-if="props.status" />
      <slot name="actions" />
    </template>

    <slot />
  </icon-card>
</template>
