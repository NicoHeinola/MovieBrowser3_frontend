<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { TaskStatusCard } from '@/components/common/task-status-card';
import { TitledSection } from '@/components/common/titled-section';
import { useVideoDurationScan } from '@/composables/setting/useVideoDurationScan';

/** Whether the last length scan started here read only the missing lengths, so that button shows the spinner. */
const isReadingMissing = ref<boolean>(true);

const { isPending, isRunning, isStarting, startScan, statusCard } = useVideoDurationScan();
const { t } = useI18n();

const isBusy = computed<boolean>(() => isStarting.value || isRunning.value);

/**
 * Starts a length scan from one of the two buttons, and remembers which one so it shows the spinner.
 * @param onlyMissing - Whether to read only the episodes without a length.
 * @returns Nothing.
 */
const readLengths = async (onlyMissing: boolean): Promise<void> => {
  isReadingMissing.value = onlyMissing;
  await startScan({ onlyMissing });
};
</script>

<template>
  <titled-section
    :subtitle="t('settings.durationScanSectionSubtitle')"
    :title="t('settings.durationScanSection')"
    icon="mdi-timer-sand"
    icon-color="warning"
  >
    <task-status-card v-bind="statusCard" :loading="isPending" />

    <template #append>
      <div class="d-flex flex-1-1 justify-end ga-2">
        <v-btn
          :disabled="isBusy"
          :loading="isBusy && !isReadingMissing"
          variant="text"
          @click="void readLengths(false)"
        >
          {{ t('settings.readEpisodeLengths') }}
        </v-btn>
        <v-btn
          :disabled="isBusy"
          :loading="isBusy && isReadingMissing"
          prepend-icon="mdi-timer-sand"
          variant="tonal"
          @click="void readLengths(true)"
        >
          {{ t('settings.readMissingLengths') }}
        </v-btn>
      </div>
    </template>
  </titled-section>
</template>
