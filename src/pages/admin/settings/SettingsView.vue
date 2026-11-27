<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { BackupManager } from '@/components/features/backup/backup-manager';
import { DefaultMediaSection } from '@/components/features/setting/default-media-section';
import { DownloadClientSettings } from '@/components/features/setting/download-client-settings';
import { VideoFileCheck } from '@/components/features/setting/video-file-check';
import { VideoSettings } from '@/components/features/setting/video-settings';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useStoredTab } from '@/composables/tab/useStoredTab';
import { SettingsTab } from '@/enums/setting/SettingsTab';
import { useSettingStore } from '@/stores/setting/useSettingStore';

const { showAPIErrorSnackbar } = useCommonSnackbar();
const settingStore = useSettingStore();
const { t } = useI18n();

/** The last tab used opens next time. */
const tab = useStoredTab<SettingsTab>('settingsTab', [
  SettingsTab.Videos,
  SettingsTab.Downloads,
  SettingsTab.HomeBanner,
  SettingsTab.Backups,
]);

const loadSettings = async (): Promise<void> => {
  try {
    // Fresh on every visit: a video base folder move or another tab may have changed them since they were cached.
    await settingStore.reloadSettings();
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};

onMounted(() => {
  void loadSettings();
});
</script>

<template>
  <page-background />

  <page-container class="mb-12">
    <v-row class="mb-4" justify="center">
      <v-col cols="auto">
        <v-tabs v-model="tab">
          <v-tab :value="SettingsTab.Videos" prepend-icon="mdi-filmstrip">{{ t('settings.videosTab') }}</v-tab>
          <v-tab :value="SettingsTab.Downloads" prepend-icon="mdi-download">{{ t('settings.downloadsSection') }}</v-tab>
          <v-tab :value="SettingsTab.HomeBanner" prepend-icon="mdi-image-outline">
            {{ t('settings.homeBannerTab') }}
          </v-tab>
          <v-tab :value="SettingsTab.Backups" prepend-icon="mdi-database-outline">{{ t('backup.section') }}</v-tab>
        </v-tabs>
      </v-col>
    </v-row>

    <!--
      Every tab stays mounted, so unsaved fields survive a switch and a run that ends in another tab is reported. The
      gap also sets the space above a row, so it is the same on each, or the content would jump between tabs.
    -->
    <v-row gap="48" v-show="tab === SettingsTab.Videos">
      <v-col cols="12" lg="6">
        <video-settings />
      </v-col>
      <v-col cols="12" lg="6">
        <video-file-check />
      </v-col>
    </v-row>

    <v-row gap="48" justify="center" v-show="tab === SettingsTab.Downloads">
      <v-col cols="12" lg="8">
        <download-client-settings />
      </v-col>
    </v-row>

    <v-row gap="48" v-show="tab === SettingsTab.HomeBanner">
      <default-media-section is-video />
      <default-media-section />
    </v-row>

    <v-row gap="48" v-show="tab === SettingsTab.Backups">
      <backup-manager />
    </v-row>
  </page-container>
</template>
