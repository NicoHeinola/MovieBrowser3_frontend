<script setup lang="ts">
import type { VideoBaseFolderMoveConfirmDialogProps } from './videoBaseFolderMoveConfirmDialogProps';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { BaseDialog } from '@/components/common/base-dialog';
import { HeadingText } from '@/components/common/heading-text';

const props = defineProps<VideoBaseFolderMoveConfirmDialogProps>();

const { t } = useI18n();

/** The two folders, the current one first. The arrow between them shows the direction. */
const folders = computed<{ labelKey: string; path: string }[]>(() => [
  { labelKey: 'settings.videoBaseFolderMoveFrom', path: props.from },
  { labelKey: 'settings.videoBaseFolderMoveTo', path: props.to },
]);
</script>

<template>
  <base-dialog :model-value="props.modelValue" max-width="520">
    <div class="d-flex flex-column ga-5">
      <div class="d-flex align-center ga-5">
        <v-avatar color="primary" rounded="lg" size="x-large" variant="tonal">
          <v-icon icon="mdi-folder-move-outline" />
        </v-avatar>
        <heading-text
          :level="2"
          :subtitle="t('settings.videoBaseFolderMoveConfirmSubtitle')"
          :title="t('settings.videoBaseFolderMoveConfirmTitle')"
        />
      </div>

      <div class="d-flex flex-column align-center ga-2">
        <template v-for="(folder, index) in folders" :key="folder.labelKey">
          <v-icon class="text-medium-emphasis" icon="mdi-arrow-down" size="small" v-if="index > 0" />
          <v-sheet border="sm" class="w-100 px-4 py-2" color="transparent" rounded="lg">
            <div class="text-label-medium text-medium-emphasis">{{ t(folder.labelKey) }}</div>
            <div class="text-body-medium text-break">{{ folder.path }}</div>
          </v-sheet>
        </template>
      </div>

      <v-alert density="compact" type="info" variant="tonal">
        {{ t('settings.videoBaseFolderMoveConfirmNote') }}
      </v-alert>
    </div>

    <template #actions>
      <v-spacer />
      <v-btn @click="props.close(false)">{{ t('common.cancel') }}</v-btn>
      <v-btn color="primary" variant="flat" @click="props.close(true)">
        {{ t('settings.videoBaseFolderMoveConfirmButton') }}
      </v-btn>
    </template>
  </base-dialog>
</template>
