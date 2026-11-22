<script setup lang="ts">
import type { Backup } from '@/interfaces/api/models/Backup';
import type { ListResponse } from '@/interfaces/api/responses/ListResponse';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { TaskStatusCard } from '@/components/common/task-status-card';
import { TitledSection } from '@/components/common/titled-section';
import { BackupTable } from '@/components/features/backup/backup-table';
import { AddDefaultBackgroundDialog } from '@/components/features/setting/add-default-background-dialog';
import { AddDefaultVideoDialog } from '@/components/features/setting/add-default-video-dialog';
import { DefaultMediaGallery } from '@/components/features/setting/default-media-gallery';
import { VideoSettings } from '@/components/features/setting/video-settings';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useVideoDurationScan } from '@/composables/setting/useVideoDurationScan';
import { useVideoFileCheck } from '@/composables/setting/useVideoFileCheck';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { BackupQueryKey } from '@/enums/query/backupQueryKey';
import { backupService } from '@/services/backup/backupService';
import { useSettingStore } from '@/stores/setting/useSettingStore';

const dialog = useDialog();
const { confirm } = useConfirmDialog();
const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
const settingStore = useSettingStore();
const { t } = useI18n();
const { isPending, isRunning, isStarting, startCheck, statusCard } = useVideoFileCheck();
const {
  isPending: isDurationScanPending,
  isRunning: isDurationScanRunning,
  isStarting: isStartingDurationScan,
  startScan: startDurationScan,
  statusCard: durationScanCard,
} = useVideoDurationScan();

const isBackingUp = ref<boolean>(false);
/** Whether the last length scan started here read only the missing lengths, so that button shows the spinner. */
const isReadingMissingLengths = ref<boolean>(true);

const backupQuery = useAPIQuery<ListResponse<Backup>>({
  queryKey: [BackupQueryKey.AdminBackups],
  queryFn: async () => await backupService.list(),
  // Scheduled backups run while this page is closed, so read them on each visit.
  staleTime: 0,
});

/**
 * Backs up the database now and reloads the list. A failure says why, such as a backup folder on a drive that isn't
 * connected: the one place the admin learns why scheduled backups fail.
 * @returns Nothing.
 */
const backUpNow = async (): Promise<void> => {
  isBackingUp.value = true;

  try {
    await backupService.create();
    showSuccessSnackbar(t('backup.finished'));
    await backupQuery.refetch();
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isBackingUp.value = false;
  }
};

/**
 * Starts a length scan from one of the two buttons, and remembers which one so it shows the spinner.
 * @param onlyMissing - Whether to read only the episodes without a length.
 * @returns Nothing.
 */
const readLengths = async (onlyMissing: boolean): Promise<void> => {
  isReadingMissingLengths.value = onlyMissing;
  await startDurationScan({ onlyMissing });
};

const loadSettings = async (): Promise<void> => {
  try {
    // Fresh on every visit: a video folder move or another tab may have changed them since they were cached.
    await settingStore.reloadSettings();
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};

const handleDeleteBackground = async (url: string): Promise<void> => {
  try {
    await settingStore.removeBannerDefaultBackground(url);
    showSuccessSnackbar(t('settings.backgroundRemoved'));
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};

const handleDeleteVideo = async (url: string): Promise<void> => {
  try {
    await settingStore.removeBannerDefaultVideo(url);
    showSuccessSnackbar(t('settings.videoRemoved'));
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};

const openAddBackgroundDialog = async (): Promise<void> => {
  await dialog.showDialog({
    component: AddDefaultBackgroundDialog,
  });
};

const openAddVideoDialog = async (): Promise<void> => {
  await dialog.showDialog({
    component: AddDefaultVideoDialog,
  });
};

const confirmDeleteBackground = async (url: string): Promise<void> => {
  const isConfirmed = await confirm({
    message: t('settings.removeBackgroundConfirm', { url }),
    confirmText: t('common.delete'),
    confirmColor: 'error',
  });

  if (!isConfirmed) {
    return;
  }

  await handleDeleteBackground(url);
};

const confirmDeleteVideo = async (url: string): Promise<void> => {
  const isConfirmed = await confirm({
    message: t('settings.removeVideoConfirm', { url }),
    confirmText: t('common.delete'),
    confirmColor: 'error',
  });

  if (!isConfirmed) {
    return;
  }

  await handleDeleteVideo(url);
};

onMounted(() => {
  void loadSettings();
});
</script>

<template>
  <page-background />
  <page-container>
    <v-row class="position-relative">
      <v-col cols="12" lg="6">
        <titled-section :subtitle="t('settings.videosSubtitle')" :title="t('settings.videosTitle')">
          <default-media-gallery
            :empty-text="t('settings.noVideos')"
            :loading="settingStore.isLoading"
            :urls="settingStore.bannerDefaultVideos"
            is-video
          >
            <template #append="{ url }">
              <v-btn
                class="glass-panel"
                color="error"
                icon="mdi-trash-can"
                size="small"
                variant="tonal"
                @click="void confirmDeleteVideo(url)"
              />
            </template>
          </default-media-gallery>

          <template #append>
            <div class="d-flex flex-1-1 justify-end">
              <v-btn
                :loading="settingStore.isLoading"
                color="primary"
                icon="mdi-plus"
                @click="void openAddVideoDialog()"
              />
            </div>
          </template>
        </titled-section>
      </v-col>

      <v-col cols="12" lg="6">
        <titled-section :subtitle="t('settings.backgroundsSubtitle')" :title="t('settings.backgroundsTitle')">
          <default-media-gallery
            :empty-text="t('settings.noBackgrounds')"
            :loading="settingStore.isLoading"
            :urls="settingStore.bannerDefaultBackgrounds"
          >
            <template #append="{ url }">
              <v-btn
                class="glass-panel"
                color="error"
                icon="mdi-trash-can"
                size="small"
                variant="tonal"
                @click="void confirmDeleteBackground(url)"
              />
            </template>
          </default-media-gallery>

          <template #append>
            <div class="d-flex flex-1-1 justify-end">
              <v-btn
                :loading="settingStore.isLoading"
                color="primary"
                icon="mdi-plus"
                @click="void openAddBackgroundDialog()"
              />
            </div>
          </template>
        </titled-section>
      </v-col>

      <v-col cols="12" lg="6">
        <titled-section :subtitle="t('settings.videoSectionSubtitle')" :title="t('settings.videoSection')">
          <video-settings />

          <template #append>
            <div class="d-flex flex-1-1 justify-end">
              <v-btn :to="{ name: 'admin-setup' }" prepend-icon="mdi-auto-fix" variant="tonal">
                {{ t('settings.openSetup') }}
              </v-btn>
            </div>
          </template>
        </titled-section>
      </v-col>

      <v-col cols="12" lg="6">
        <titled-section :subtitle="t('settings.videoFilesSectionSubtitle')" :title="t('settings.videoFilesSection')">
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
      </v-col>

      <v-col cols="12" lg="6">
        <titled-section
          :subtitle="t('settings.durationScanSectionSubtitle')"
          :title="t('settings.durationScanSection')"
        >
          <task-status-card v-bind="durationScanCard" :loading="isDurationScanPending" />

          <template #append>
            <div class="d-flex flex-1-1 justify-end ga-2">
              <v-btn
                :disabled="isDurationScanRunning || isStartingDurationScan"
                :loading="(isStartingDurationScan || isDurationScanRunning) && !isReadingMissingLengths"
                variant="text"
                @click="void readLengths(false)"
              >
                {{ t('settings.readEpisodeLengths') }}
              </v-btn>
              <v-btn
                :disabled="isDurationScanRunning || isStartingDurationScan"
                :loading="(isStartingDurationScan || isDurationScanRunning) && isReadingMissingLengths"
                prepend-icon="mdi-timer-sand"
                variant="tonal"
                @click="void readLengths(true)"
              >
                {{ t('settings.readMissingLengths') }}
              </v-btn>
            </div>
          </template>
        </titled-section>
      </v-col>

      <v-col cols="12">
        <titled-section :subtitle="t('backup.sectionSubtitle')" :title="t('backup.section')">
          <backup-table :backups="backupQuery.data.value?.data ?? []" :is-pending="backupQuery.isPending.value" />

          <template #append>
            <div class="d-flex flex-1-1 justify-end">
              <v-btn
                :loading="isBackingUp"
                prepend-icon="mdi-database-export-outline"
                variant="tonal"
                @click="void backUpNow()"
              >
                {{ t('backup.backUpNow') }}
              </v-btn>
            </div>
          </template>
        </titled-section>
      </v-col>
    </v-row>
  </page-container>
</template>
