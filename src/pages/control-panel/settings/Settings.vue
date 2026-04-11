<script setup lang="ts">
import { onMounted } from 'vue';

import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { TitledSection } from '@/components/common/titled-section';
import { AddDefaultBackgroundDialog } from '@/components/features/setting/add-default-background-dialog';
import { AddDefaultVideoDialog } from '@/components/features/setting/add-default-video-dialog';
import { DefaultBackgroundGallery } from '@/components/features/setting/default-background-gallery';
import { DefaultVideoGallery } from '@/components/features/setting/default-video-gallery';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useSettingStore } from '@/stores/setting/useSettingStore';

const dialog = useDialog();
const { confirm } = useConfirmDialog();
const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
const settingStore = useSettingStore();

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
    showSuccessSnackbar('Background removed.');
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};

const handleDeleteVideo = async (url: string): Promise<void> => {
  try {
    await settingStore.removeBannerDefaultVideo(url);
    showSuccessSnackbar('Video removed.');
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
    message: `Remove this default banner background?\n\n${url}`,
    confirmText: 'Delete',
    confirmColor: 'error',
  });

  if (!isConfirmed) {
    return;
  }

  await handleDeleteBackground(url);
};

const confirmDeleteVideo = async (url: string): Promise<void> => {
  const isConfirmed = await confirm({
    message: `Remove this default banner video?\n\n${url}`,
    confirmText: 'Delete',
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
  <page-container class="fill-height position-relative">
    <v-row class="position-relative">
      <v-col cols="12" lg="6">
        <titled-section
          subtitle="These take priority over the backgrounds and will be randomly played on the home page banner."
          title="Default Banner Videos"
        >
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
        <titled-section
          subtitle="These are randomly showed on the home page when there is no video available."
          title="Default Banner Backgrounds"
        >
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
    </v-row>
  </page-container>
</template>
