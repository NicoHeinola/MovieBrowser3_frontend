<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { FormCard } from '@/components/common/form-card';
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
  <titled-section
    :subtitle="t('settings.downloadsSectionSubtitle')"
    :title="t('settings.downloadsSection')"
    icon="mdi-download"
    icon-color="info"
  >
    <form-card>
      <v-skeleton-loader type="text@3" v-if="!settingStore.hasLoaded" />
      <template v-else>
        <download-client-form
          v-model:is-valid="isValid"
          v-model:request="request"
          :checks="checks"
          :is-password-saved="isPasswordSaved"
          @submit="submit"
          :id="FORM_ID"
        />

        <div class="d-flex justify-end">
          <v-btn :disabled="!isValid" :form="FORM_ID" :loading="isSaving" color="primary" type="submit">
            {{ t('common.save') }}
          </v-btn>
        </div>
      </template>
    </form-card>
  </titled-section>
</template>
