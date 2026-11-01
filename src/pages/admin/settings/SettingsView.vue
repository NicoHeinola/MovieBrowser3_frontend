<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { TitledSection } from '@/components/common/titled-section';
import { AddDefaultBackgroundDialog } from '@/components/features/setting/add-default-background-dialog';
import { AddDefaultVideoDialog } from '@/components/features/setting/add-default-video-dialog';
import { DefaultBackgroundGallery } from '@/components/features/setting/default-background-gallery';
import { DefaultVideoGallery } from '@/components/features/setting/default-video-gallery';
import { VideoSettings } from '@/components/features/setting/video-settings';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useSettingStore } from '@/stores/setting/useSettingStore';

const dialog = useDialog();
const { confirm } = useConfirmDialog();
const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
const settingStore = useSettingStore();
const { t } = useI18n();

const loadSettings = async (): Promise<void> => {
  try {
    await settingStore.fetchSettings();
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
          <default-video-gallery>
            <template #actions="{ url }">
              <v-btn
                color="error"
                icon="mdi-trash-can"
                size="small"
                variant="tonal"
                @click="void confirmDeleteVideo(url)"
              />
            </template>
          </default-video-gallery>

          <template #append>
            <div class="d-flex flex-1-1 justify-end">
              <v-btn :loading="settingStore.isLoading" icon="mdi-plus" @click="void openAddVideoDialog()" />
            </div>
          </template>
        </titled-section>
      </v-col>

      <v-col cols="12" lg="6">
        <titled-section :subtitle="t('settings.backgroundsSubtitle')" :title="t('settings.backgroundsTitle')">
          <default-background-gallery>
            <template #actions="{ url }">
              <v-btn
                color="error"
                icon="mdi-trash-can"
                size="small"
                variant="tonal"
                @click="void confirmDeleteBackground(url)"
              />
            </template>
          </default-background-gallery>

          <template #append>
            <div class="d-flex flex-1-1 justify-end">
              <v-btn :loading="settingStore.isLoading" icon="mdi-plus" @click="void openAddBackgroundDialog()" />
            </div>
          </template>
        </titled-section>
      </v-col>

      <v-col cols="12" lg="6">
        <titled-section :subtitle="t('settings.videoSectionSubtitle')" :title="t('settings.videoSection')">
          <video-settings />
        </titled-section>
      </v-col>
    </v-row>
  </page-container>
</template>
