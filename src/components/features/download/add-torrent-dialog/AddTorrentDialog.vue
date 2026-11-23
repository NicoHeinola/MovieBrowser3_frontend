<script setup lang="ts">
import type { DialogComponentProps } from '@/components/layouts/dialog-provider';

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { BaseDialog } from '@/components/common/base-dialog';
import { BaseForm } from '@/components/common/base-form';
import { useDownloadCreate } from '@/composables/download/useDownloadCreate';
import { getMagnetName } from '@/utils/download/getMagnetName';

import { getRules } from './addTorrentDialogRules';

const FORM_ID = 'add-torrent-form';

/** Closes with the new download's id, or nothing when cancelled. */
const props = defineProps<DialogComponentProps<number>>();

const isDialogVisible = defineModel<boolean>({ required: true });

const magnetUrl = ref<string>('');
const isValid = ref<boolean>(false);

const { create, errorMessage, isCreating } = useDownloadCreate();
const { t } = useI18n();
const rules = getRules();

/**
 * Hands the pasted torrent to qBittorrent. A failure keeps the dialog open with the reason.
 * @returns Nothing.
 */
const add = async (): Promise<void> => {
  if (!isValid.value || isCreating.value) {
    return;
  }

  const url = magnetUrl.value.trim();
  // A magnet without a name gets qBittorrent's name for the torrent
  const downloadId = await create({ magnet_url: url, name: getMagnetName(url) });

  if (downloadId !== null) {
    props.close(downloadId);
  }
};
</script>

<template>
  <base-dialog v-model="isDialogVisible" max-width="600px">
    <template #title> {{ t('download.addTorrentTitle') }} </template>

    <template #default>
      <div class="d-flex flex-column ga-4">
        <span class="text-medium-emphasis text-body-small">{{ t('download.addTorrentHint') }}</span>

        <base-form v-model:is-valid="isValid" @submit="add" :id="FORM_ID">
          <v-text-field
            v-model="magnetUrl"
            :label="t('download.magnetLink')"
            :rules="rules.magnetUrl"
            class="required"
            prepend-inner-icon="mdi-magnet"
            autofocus
          />
        </base-form>

        <v-alert type="error" v-if="errorMessage">{{ errorMessage }}</v-alert>
      </div>
    </template>

    <template #actions>
      <v-spacer />
      <v-btn :disabled="isCreating" variant="text" @click="props.close()"> {{ t('common.cancel') }} </v-btn>
      <v-btn :disabled="!isValid" :form="FORM_ID" :loading="isCreating" color="primary" type="submit" variant="flat">
        {{ t('download.add') }}
      </v-btn>
    </template>
  </base-dialog>
</template>
