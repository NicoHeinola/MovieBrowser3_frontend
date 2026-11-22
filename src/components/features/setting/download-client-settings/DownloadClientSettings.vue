<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { TitledSection } from '@/components/common/titled-section';
import { DownloadClientForm } from '@/components/features/setting/download-client-form';
import { useDownloadClientSettings } from '@/composables/setting/useDownloadClientSettings';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useSettingStore } from '@/stores/setting/useSettingStore';

const FORM_ID = 'download-client-form';

const isValid = ref<boolean>(false);

const settingStore = useSettingStore();
const { checks, isPasswordSaved, isSaving, request, save } = useDownloadClientSettings();
const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
const { t } = useI18n();

/** Whether settings have loaded once. A reload after saving keeps the old values, so only the first load has none. */
const hasLoadedSettings = computed<boolean>(() => Object.keys(settingStore.settings).length > 0);

/**
 * Checks and saves the connection, and says so when it saved. A failed check shows under its field instead.
 * @returns Nothing.
 */
const submit = async (): Promise<void> => {
  if (!isValid.value) {
    return;
  }

  try {
    if (await save()) {
      showSuccessSnackbar(t('settings.updated'));
    }
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  }
};
</script>

<template>
  <titled-section :subtitle="t('settings.downloadsSectionSubtitle')" :title="t('settings.downloadsSection')">
    <v-skeleton-loader type="text@3" v-if="!hasLoadedSettings" />
    <download-client-form
      v-model:is-valid="isValid"
      v-model:request="request"
      :checks="checks"
      :is-password-saved="isPasswordSaved"
      @submit="submit"
      :id="FORM_ID"
      v-else
    />

    <template #append>
      <div class="d-flex flex-1-1 justify-end">
        <v-btn
          :disabled="!isValid || !hasLoadedSettings"
          :form="FORM_ID"
          :loading="isSaving"
          color="primary"
          type="submit"
        >
          {{ t('common.save') }}
        </v-btn>
      </div>
    </template>
  </titled-section>
</template>
