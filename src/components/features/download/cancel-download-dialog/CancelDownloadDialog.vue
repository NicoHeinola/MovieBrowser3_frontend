<script setup lang="ts">
import type { CancelDownloadDialogProps } from './cancelDownloadDialogProps';

import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { BaseDialog } from '@/components/common/base-dialog';
import { DownloadCard } from '@/components/features/download/download-card';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { DownloadStatus } from '@/enums/download/DownloadStatus';
import { downloadService } from '@/services/download/downloadService';
import { getDownloadProgress } from '@/utils/download/getDownloadProgress';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';

const props = defineProps<CancelDownloadDialogProps>();

const isDialogVisible = defineModel<boolean>({ required: true });

/** Episodes made for the download are of no use without it, so removing them is the default. */
const removeEpisodes = ref<boolean>(true);
const isCancelling = ref<boolean>(false);

const { showAPIErrorSnackbar } = useCommonSnackbar();
const { t } = useI18n();

const waitingEpisodeCount = computed<number>(() => props.download.waiting_episode_count ?? 0);

/** A finished download only leaves the list: its episodes have their videos, and qBittorrent may still seed it. */
const isFinished = computed<boolean>(() => props.download.status === DownloadStatus.Completed);

/** Its show and how far it got, under its name. */
const details = computed<string>(() => {
  const progress = getDownloadProgress(props.download);

  return [props.download.show ? getPrimaryTitle(props.download.show) : null, progress?.percent, progress?.bytes]
    .filter((part) => part != null)
    .join(', ');
});

/**
 * Cancels the download. A failure keeps the dialog open to try again, such as once qBittorrent runs.
 * @returns Nothing.
 */
const cancel = async (): Promise<void> => {
  isCancelling.value = true;

  try {
    await downloadService.remove(props.download.id, removeEpisodes.value && waitingEpisodeCount.value > 0);
    props.close(true);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isCancelling.value = false;
  }
};
</script>

<template>
  <base-dialog v-model="isDialogVisible" max-width="600px">
    <template #title> {{ isFinished ? t('download.removeTitle') : t('download.cancelTitle') }} </template>

    <template #default>
      <div class="d-flex flex-column ga-4">
        <!-- The torrent, like the download dialog shows it -->
        <download-card :details="details" :name="props.download.name" :status="props.download.status" />

        <v-alert class="flex-0-1" type="info" variant="tonal" v-if="isFinished">{{ t('download.removeText') }}</v-alert>
        <v-alert class="flex-0-1" type="warning" variant="tonal" v-else>{{ t('download.cancelText') }}</v-alert>

        <!-- A choice about the episodes, apart from the cancel itself -->
        <v-sheet border="sm" rounded="lg" v-if="waitingEpisodeCount > 0">
          <v-list-item
            :subtitle="t('download.waitingEpisodesHint', { count: waitingEpisodeCount }, waitingEpisodeCount)"
            :title="t('download.removeWaitingEpisodes', { count: waitingEpisodeCount }, waitingEpisodeCount)"
            class="py-4"
            prepend-icon="mdi-playlist-remove"
            @click="removeEpisodes = !removeEpisodes"
          >
            <template #append>
              <v-switch v-model="removeEpisodes" color="error" hide-details @click.stop />
            </template>
          </v-list-item>
        </v-sheet>
      </div>
    </template>

    <template #actions>
      <v-spacer />
      <v-btn :disabled="isCancelling" variant="text" @click="props.close()"> {{ t('download.keep') }} </v-btn>
      <v-btn :loading="isCancelling" color="error" variant="flat" @click="void cancel()">
        {{ isFinished ? t('download.remove') : t('download.cancel') }}
      </v-btn>
    </template>
  </base-dialog>
</template>
