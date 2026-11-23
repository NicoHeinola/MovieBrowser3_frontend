<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { BaseForm } from '@/components/common/base-form';
import { FormCard } from '@/components/common/form-card';
import { TaskStatusCard } from '@/components/common/task-status-card';
import { TitledSection } from '@/components/common/titled-section';
import { VideoRelocationConfirmDialog } from '@/components/features/setting/video-relocation-confirm-dialog';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useVideoRelocation } from '@/composables/setting/useVideoRelocation';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { SettingKey } from '@/enums/setting/SettingKey';
import { useSettingStore } from '@/stores/setting/useSettingStore';

import { getRules } from './videoSettingsRules';

const FORM_ID = 'video-settings-form';

/** Local drafts so unsaved edits never leak into the store and missing keys don't break rendering. */
const videoBasePath = ref<string>('');
const vlcMediaPlayerPath = ref<string>('');
const isValid = ref<boolean>(false);
const isSavingVlcPath = ref<boolean>(false);

const rules = getRules();
const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();

const settingStore = useSettingStore();
const dialog = useDialog();
const { t } = useI18n();
const { isRunning: isRelocating, isStarting: isStartingRelocation, startRelocation, statusCard } = useVideoRelocation();

const savedVideoBasePath = computed<string>(() => settingStore.getSetting(SettingKey.VideoBasePath) ?? '');
const savedVlcMediaPlayerPath = computed<string>(() => settingStore.getSetting(SettingKey.VlcMediaPlayerPath) ?? '');

const isVideoBasePathChanged = computed<boolean>(() => videoBasePath.value.trim() !== savedVideoBasePath.value);
const isVlcPathChanged = computed<boolean>(() => vlcMediaPlayerPath.value.trim() !== savedVlcMediaPlayerPath.value);

/** The folder draft stays changed until its move ends, so a running move must not start another. */
const canRelocate = computed<boolean>(() => isVideoBasePathChanged.value && !isRelocating.value);
const isSaving = computed<boolean>(() => isSavingVlcPath.value || isStartingRelocation.value);
/** Saving unchanged paths would do nothing, so Save waits for an edit. */
const canSave = computed<boolean>(() => isValid.value && (canRelocate.value || isVlcPathChanged.value));

/**
 * Saves the VLC path as a plain setting.
 * @returns Whether it saved.
 */
const saveVlcPath = async (): Promise<boolean> => {
  isSavingVlcPath.value = true;

  try {
    await settingStore.updateSetting(SettingKey.VlcMediaPlayerPath, vlcMediaPlayerPath.value.trim());
    showSuccessSnackbar(t('settings.updated'));

    return true;
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);

    return false;
  } finally {
    isSavingVlcPath.value = false;
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

/**
 * Saves the paths that changed.
 * @returns Nothing.
 */
const save = async (): Promise<void> => {
  // Enter submits even while the button is disabled or loading.
  if (!canSave.value || isSaving.value) {
    return;
  }

  // The quick one first: a move asks to confirm, and turning that down must not lose the VLC path.
  if (isVlcPathChanged.value && !(await saveVlcPath())) {
    return;
  }

  // Checked only now: the VLC save reloads the settings, and the folder may have changed elsewhere since.
  if (canRelocate.value) {
    await relocateVideos();
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
  <titled-section
    :subtitle="t('settings.videoSectionSubtitle')"
    :title="t('settings.videoSection')"
    icon="mdi-folder-play-outline"
    icon-color="primary"
  >
    <form-card>
      <v-skeleton-loader type="text@2" v-if="!settingStore.hasLoaded" />
      <template v-else>
        <base-form v-model:is-valid="isValid" @submit="save" :id="FORM_ID">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="videoBasePath"
                :label="t('settings.videoBasePath')"
                :readonly="isRelocating"
                :rules="rules.videoBasePath"
                class="required"
              >
                <template #prepend>
                  <v-icon icon="mdi-help-circle" v-tooltip:bottom="t('settings.videoBasePathHint')" />
                </template>
              </v-text-field>
            </v-col>
            <!-- Indented past the field's help icon, so the card lines up under the field it reports on. -->
            <v-col class="pt-0" cols="12" v-if="statusCard">
              <task-status-card class="ms-10" v-bind="statusCard" />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="vlcMediaPlayerPath"
                :label="t('settings.vlcPath')"
                :rules="rules.vlcMediaPlayerPath"
              >
                <template #prepend>
                  <v-icon icon="mdi-help-circle" v-tooltip:bottom="t('settings.vlcPathHint')" />
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </base-form>

        <div class="d-flex justify-end">
          <v-btn :disabled="!canSave" :form="FORM_ID" :loading="isSaving" color="primary" type="submit">
            {{ t('common.save') }}
          </v-btn>
        </div>
      </template>
    </form-card>

    <template #append>
      <div class="d-flex flex-1-1 justify-end">
        <v-btn :to="{ name: 'admin-setup' }" prepend-icon="mdi-auto-fix" variant="tonal">
          {{ t('settings.openSetup') }}
        </v-btn>
      </div>
    </template>
  </titled-section>
</template>
