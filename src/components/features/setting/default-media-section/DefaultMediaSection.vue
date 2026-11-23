<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { TitledSection } from '@/components/common/titled-section';
import { AddDefaultBackgroundDialog } from '@/components/features/setting/add-default-background-dialog';
import { AddDefaultVideoDialog } from '@/components/features/setting/add-default-video-dialog';
import { DefaultMediaGallery } from '@/components/features/setting/default-media-gallery';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useSettingStore } from '@/stores/setting/useSettingStore';

const props = withDefaults(
  defineProps<{
    /** Whether the section holds the home banner's videos instead of its backgrounds. */
    isVideo?: boolean;
  }>(),
  {
    isVideo: false,
  },
);

const dialog = useDialog();
const { confirm } = useConfirmDialog();
const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
const settingStore = useSettingStore();
const { t } = useI18n();

/** What differs between the videos and the backgrounds. */
const media = computed(() =>
  props.isVideo
    ? {
        icon: 'mdi-youtube',
        iconColor: 'error',
        title: t('settings.videosTitle'),
        subtitle: t('settings.videosSubtitle'),
        emptyText: t('settings.noVideos'),
        addText: t('settings.addVideoButton'),
        removedText: t('settings.videoRemoved'),
        removeConfirmKey: 'settings.removeVideoConfirm',
        urls: settingStore.bannerDefaultVideos,
        addDialog: AddDefaultVideoDialog,
        remove: settingStore.removeBannerDefaultVideo,
      }
    : {
        icon: 'mdi-image-outline',
        iconColor: 'info',
        title: t('settings.backgroundsTitle'),
        subtitle: t('settings.backgroundsSubtitle'),
        emptyText: t('settings.noBackgrounds'),
        addText: t('settings.addBackgroundButton'),
        removedText: t('settings.backgroundRemoved'),
        removeConfirmKey: 'settings.removeBackgroundConfirm',
        urls: settingStore.bannerDefaultBackgrounds,
        addDialog: AddDefaultBackgroundDialog,
        remove: settingStore.removeBannerDefaultBackground,
      },
);

/**
 * Opens the dialog that adds a url.
 * @returns Nothing.
 */
const openAddDialog = async (): Promise<void> => {
  await dialog.showDialog({ component: media.value.addDialog });
};

/**
 * Removes a url after confirming.
 * @param url - The url to remove.
 * @returns Nothing.
 */
const removeUrl = async (url: string): Promise<void> => {
  const { remove, removeConfirmKey, removedText } = media.value;

  const isConfirmed = await confirm({
    message: t(removeConfirmKey, { url }),
    confirmText: t('common.delete'),
    confirmColor: 'error',
  });

  if (!isConfirmed) {
    return;
  }

  try {
    await remove(url);
    showSuccessSnackbar(removedText);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};
</script>

<template>
  <titled-section :icon="media.icon" :icon-color="media.iconColor" :subtitle="media.subtitle" :title="media.title">
    <default-media-gallery
      :empty-text="media.emptyText"
      :is-video="props.isVideo"
      :loading="!settingStore.hasLoaded"
      :urls="media.urls"
    >
      <template #append="{ url }">
        <v-btn
          class="glass-panel"
          color="error"
          icon="mdi-trash-can"
          size="small"
          variant="tonal"
          @click="void removeUrl(url)"
        />
      </template>
    </default-media-gallery>

    <template #append>
      <div class="d-flex flex-1-1 justify-end">
        <v-btn :loading="settingStore.isLoading" color="primary" prepend-icon="mdi-plus" @click="void openAddDialog()">
          {{ media.addText }}
        </v-btn>
      </div>
    </template>
  </titled-section>
</template>
