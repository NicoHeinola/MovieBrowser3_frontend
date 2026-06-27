<script setup lang="ts">
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useSettingStore } from '@/stores/setting/useSettingStore';
import { getRules } from './videoSettingsRules';

const rules = getRules();
const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();

const settingStore = useSettingStore();

const updateSetting = async (key: string, value: unknown): Promise<void> => {
  try {
    await settingStore.updateSetting(key, value);
    showSuccessSnackbar('Setting updated.');
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};
</script>

<template>
  <v-row>
    <v-col class="d-flex ga-2 align-center" cols="12">
      <template v-if="settingStore.isLoading">
        <v-skeleton-loader type="text" width="45" />
        <v-skeleton-loader type="text" width="390" />
        <v-skeleton-loader type="text" width="65" />
      </template>
      <template v-else>
        <v-text-field
          v-model="settingStore.settings.video_base_path.value"
          :rules="rules.videoBasePath"
          label="Video base path"
        >
          <template #prepend>
            <v-icon
              icon="mdi-help-circle"
              v-tooltip:bottom="
                'App uses this folder to store and play video files. This folder can contain sub-folders for shows.'
              "
            />
          </template>
        </v-text-field>
        <v-btn @click="updateSetting('video_base_path', settingStore.settings.video_base_path.value)"> Save </v-btn>
      </template>
    </v-col>
    <v-col class="d-flex ga-2 align-center" cols="12">
      <template v-if="settingStore.isLoading">
        <v-skeleton-loader type="text" width="45" />
        <v-skeleton-loader type="text" width="390" />
        <v-skeleton-loader type="text" width="65" />
      </template>
      <template v-else>
        <v-text-field
          v-model="settingStore.settings.vlc_media_player_path.value"
          :rules="rules.vlcMediaPlayerPath"
          label="VLC Media Player path"
        >
          <template #prepend>
            <v-icon icon="mdi-help-circle" v-tooltip:bottom="'Without this, the app cannot play videos.'" />
          </template>
        </v-text-field>
        <v-btn @click="updateSetting('vlc_media_player_path', settingStore.settings.vlc_media_player_path.value)">
          Save
        </v-btn>
      </template>
    </v-col>
  </v-row>
</template>
