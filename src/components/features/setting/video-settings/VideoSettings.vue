<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { BaseForm } from '@/components/common/base-form';
import { TaskStatusCard } from '@/components/common/task-status-card';
import { VideoRelocationConfirmDialog } from '@/components/features/setting/video-relocation-confirm-dialog';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useVideoRelocation } from '@/composables/setting/useVideoRelocation';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { SettingKey } from '@/enums/setting/SettingKey';
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
const dialog = useDialog();
const { t } = useI18n();
const { isRunning: isRelocating, isStarting: isStartingRelocation, startRelocation, statusCard } = useVideoRelocation();

const savedVideoBasePath = computed<string>(() => settingStore.getSetting(SettingKey.VideoBasePath) ?? '');
const savedVlcMediaPlayerPath = computed<string>(() => settingStore.getSetting(SettingKey.VlcMediaPlayerPath) ?? '');

/** Saving an unchanged path would do nothing, so each Save button waits for an edit. */
const isVideoBasePathChanged = computed<boolean>(() => videoBasePath.value.trim() !== savedVideoBasePath.value);
const isVlcPathChanged = computed<boolean>(() => vlcMediaPlayerPath.value.trim() !== savedVlcMediaPlayerPath.value);

/**
 * Saves the VLC path as a plain setting.
 * @returns Nothing.
 */
const saveVlcPath = async (): Promise<void> => {
  try {
    await settingStore.updateSetting(SettingKey.VlcMediaPlayerPath, vlcMediaPlayerPath.value.trim());
    showSuccessSnackbar(t('settings.updated'));
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};

/**
 * Moves the videos into the new folder. The folder setting changes only once the move ends, and the move reports that.
 * @returns Nothing.
 */
const relocateVideos = async (): Promise<void> => {
  const path = videoBasePath.value.trim();

  // Moving every video can take hours and holds up editing and playback, so ask first. A first folder has nothing to
  // move, so it just saves.
  if (savedVideoBasePath.value !== '') {
    const isConfirmed = await dialog.showDialog<boolean, { from: string; to: string }>({
      component: VideoRelocationConfirmDialog,
      props: { from: savedVideoBasePath.value, to: path },
    });

    if (!isConfirmed) {
      return;
    }
  }

  try {
    await startRelocation(path);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};

// Each draft follows only its own saved value, so a reload after a move doesn't wipe an unsaved VLC path edit.
watch(
  savedVideoBasePath,
  (path: string) => {
    videoBasePath.value = path;
  },
  { immediate: true },
);

watch(
  savedVlcMediaPlayerPath,
  (path: string) => {
    vlcMediaPlayerPath.value = path;
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
          @submit="relocateVideos"
          :id="VIDEO_BASE_PATH_FORM_ID"
        >
          <div class="d-flex ga-2 align-center">
            <v-text-field
              v-model="videoBasePath"
              :label="t('settings.videoBasePath')"
              :readonly="isRelocating"
              :rules="rules.videoBasePath"
            >
              <template #prepend>
                <v-icon icon="mdi-help-circle" v-tooltip:bottom="t('settings.videoBasePathHint')" />
              </template>
            </v-text-field>
            <v-btn
              :disabled="!isVideoBasePathValid || !isVideoBasePathChanged || isRelocating"
              :loading="isStartingRelocation"
              color="primary"
              type="submit"
            >
              {{ t('common.save') }}
            </v-btn>
          </div>
        </base-form>
      </template>
    </v-col>
    <!-- Indented past the field's help icon, so the card lines up under the field it reports on. -->
    <v-col class="pt-0" cols="12" v-if="statusCard">
      <task-status-card class="ms-10" v-bind="statusCard" />
    </v-col>
    <v-col class="d-flex ga-2 align-center" cols="12">
      <template v-if="settingStore.isLoading">
        <v-skeleton-loader type="text" width="45" />
        <v-skeleton-loader type="text" width="390" />
        <v-skeleton-loader type="text" width="65" />
      </template>
      <template v-else>
        <base-form v-model:is-valid="isVlcPathValid" class="flex-1-1" @submit="saveVlcPath" :id="VLC_PATH_FORM_ID">
          <div class="d-flex ga-2 align-center">
            <v-text-field v-model="vlcMediaPlayerPath" :label="t('settings.vlcPath')" :rules="rules.vlcMediaPlayerPath">
              <template #prepend>
                <v-icon icon="mdi-help-circle" v-tooltip:bottom="t('settings.vlcPathHint')" />
              </template>
            </v-text-field>
            <v-btn :disabled="!isVlcPathValid || !isVlcPathChanged" color="primary" type="submit">
              {{ t('common.save') }}
            </v-btn>
          </div>
        </base-form>
      </template>
    </v-col>
  </v-row>
</template>
