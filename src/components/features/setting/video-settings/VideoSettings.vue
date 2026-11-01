<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useSettingStore } from '@/stores/setting/useSettingStore';
import { getRules } from './videoSettingsRules';

/** Local drafts so unsaved edits never leak into the store and missing keys don't break rendering. */
const videoBasePath = ref<string>('');
const vlcMediaPlayerPath = ref<string>('');

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
        <v-text-field v-model="videoBasePath" :label="t('settings.videoBasePath')" :rules="rules.videoBasePath">
          <template #prepend>
            <v-icon icon="mdi-help-circle" v-tooltip:bottom="t('settings.videoBasePathHint')" />
          </template>
        </v-text-field>
        <v-btn color="primary" @click="updateSetting('video_base_path', videoBasePath)"> {{ t('common.save') }} </v-btn>
      </template>
    </v-col>
    <v-col class="d-flex ga-2 align-center" cols="12">
      <template v-if="settingStore.isLoading">
        <v-skeleton-loader type="text" width="45" />
        <v-skeleton-loader type="text" width="390" />
        <v-skeleton-loader type="text" width="65" />
      </template>
      <template v-else>
        <v-text-field v-model="vlcMediaPlayerPath" :label="t('settings.vlcPath')" :rules="rules.vlcMediaPlayerPath">
          <template #prepend>
            <v-icon icon="mdi-help-circle" v-tooltip:bottom="t('settings.vlcPathHint')" />
          </template>
        </v-text-field>
        <v-btn color="primary" @click="updateSetting('vlc_media_player_path', vlcMediaPlayerPath)">
          {{ t('common.save') }}
        </v-btn>
      </template>
    </v-col>
  </v-row>
</template>
