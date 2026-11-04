<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { BaseForm } from '@/components/common/base-form';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useSettingStore } from '@/stores/setting/useSettingStore';

import { getRules } from './videoSettingsRules';

const VIDEO_BASE_PATH_FORM_ID = 'video-base-path-form';
const VLC_PATH_FORM_ID = 'vlc-path-form';

/** Local drafts so unsaved edits never leak into the store and missing keys don't break rendering. */
const videoBasePath = ref<string>('');
const vlcMediaPlayerPath = ref<string>('');
const isVideoBasePathValid = ref<boolean>(false);
const isVlcPathValid = ref<boolean>(false);

const rules = getRules();
const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();

const settingStore = useSettingStore();
const { t } = useI18n();

const updateSetting = async (key: string, value: unknown): Promise<void> => {
  try {
    await settingStore.updateSetting(key, value);
    showSuccessSnackbar(t('settings.updated'));
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};

watch(
  () => settingStore.settings,
  () => {
    videoBasePath.value = settingStore.getSetting<string>('video_base_path') ?? '';
    vlcMediaPlayerPath.value = settingStore.getSetting<string>('vlc_media_player_path') ?? '';
  },
  { immediate: true },
);
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
        <base-form
          v-model:is-valid="isVideoBasePathValid"
          class="flex-1-1"
          @submit="updateSetting('video_base_path', videoBasePath)"
          :id="VIDEO_BASE_PATH_FORM_ID"
        >
          <v-text-field v-model="videoBasePath" :label="t('settings.videoBasePath')" :rules="rules.videoBasePath">
            <template #prepend>
              <v-icon icon="mdi-help-circle" v-tooltip:bottom="t('settings.videoBasePathHint')" />
            </template>
            <template #append>
              <v-btn :disabled="!isVideoBasePathValid" color="primary" type="submit">
                {{ t('common.save') }}
              </v-btn>
            </template>
          </v-text-field>
        </base-form>
      </template>
    </v-col>
    <v-col class="d-flex ga-2 align-center" cols="12">
      <template v-if="settingStore.isLoading">
        <v-skeleton-loader type="text" width="45" />
        <v-skeleton-loader type="text" width="390" />
        <v-skeleton-loader type="text" width="65" />
      </template>
      <template v-else>
        <base-form
          v-model:is-valid="isVlcPathValid"
          class="flex-1-1"
          @submit="updateSetting('vlc_media_player_path', vlcMediaPlayerPath)"
          :id="VLC_PATH_FORM_ID"
        >
          <v-text-field v-model="vlcMediaPlayerPath" :label="t('settings.vlcPath')" :rules="rules.vlcMediaPlayerPath">
            <template #prepend>
              <v-icon icon="mdi-help-circle" v-tooltip:bottom="t('settings.vlcPathHint')" />
            </template>
            <template #append>
              <v-btn :disabled="!isVlcPathValid" color="primary" type="submit">
                {{ t('common.save') }}
              </v-btn>
            </template>
          </v-text-field>
        </base-form>
      </template>
    </v-col>
  </v-row>
</template>
