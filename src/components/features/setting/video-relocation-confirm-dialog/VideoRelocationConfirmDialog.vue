<script setup lang="ts">
import type { VideoRelocationConfirmDialogProps } from './videoRelocationConfirmDialogProps';

import { useI18n } from 'vue-i18n';

import { BaseDialog } from '@/components/common/base-dialog';
import { HeadingText } from '@/components/common/heading-text';

const props = defineProps<VideoRelocationConfirmDialogProps>();

const { t } = useI18n();
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
          :subtitle="t('settings.videoRelocationConfirmSubtitle')"
          :title="t('settings.videoRelocationConfirmTitle')"
        />
      </div>

      <div class="d-flex flex-column align-center ga-2">
        <v-sheet border="sm" class="w-100 px-4 py-2" color="transparent" rounded="lg">
          <div class="text-label-medium text-medium-emphasis">{{ t('settings.videoRelocationFrom') }}</div>
          <div class="text-body-medium text-break">{{ props.from }}</div>
        </v-sheet>
        <v-icon class="text-medium-emphasis" icon="mdi-arrow-down" size="small" />
        <v-sheet border="sm" class="w-100 px-4 py-2" color="transparent" rounded="lg">
          <div class="text-label-medium text-medium-emphasis">{{ t('settings.videoRelocationTo') }}</div>
          <div class="text-body-medium text-break">{{ props.to }}</div>
        </v-sheet>
      </div>

      <v-alert density="compact" type="info" variant="tonal">{{ t('settings.videoRelocationConfirmNote') }}</v-alert>
    </div>

    <template #actions>
      <v-spacer />
      <v-btn @click="props.close(false)">{{ t('common.cancel') }}</v-btn>
      <v-btn color="primary" variant="flat" @click="props.close(true)">
        {{ t('settings.videoRelocationConfirmButton') }}
      </v-btn>
    </template>
  </base-dialog>
</template>
