<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { TaskStatusCard } from '@/components/common/task-status-card';
import { TitledSection } from '@/components/common/titled-section';
import { useVideoFileCheck } from '@/composables/setting/useVideoFileCheck';

const { isPending, isRunning, isStarting, startCheck, statusCard } = useVideoFileCheck();
const { t } = useI18n();
</script>

<template>
  <titled-section
    :subtitle="t('settings.videoFilesSectionSubtitle')"
    :title="t('settings.videoFilesSection')"
    icon="mdi-file-search-outline"
    icon-color="info"
  >
    <task-status-card v-bind="statusCard" :loading="isPending" />

    <template #append>
      <div class="d-flex flex-1-1 justify-end">
        <v-btn
          :disabled="isRunning"
          :loading="isStarting || isRunning"
          prepend-icon="mdi-file-search-outline"
          variant="tonal"
          @click="void startCheck()"
        >
          {{ t('settings.checkVideoFiles') }}
        </v-btn>
      </div>
    </template>
  </titled-section>
</template>
