<script setup lang="ts">
import type { SetupCheckResult } from '@/interfaces/api/models/SetupCheckResult';
import type { SetupChecks } from '@/interfaces/api/models/SetupChecks';
import type { DownloadClientRequest } from '@/interfaces/setting/DownloadClientRequest';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { BaseForm } from '@/components/common/base-form';
import { PasswordField } from '@/components/common/password-field';
import { SettingKey } from '@/enums/setting/SettingKey';

import { getRules } from './downloadClientFormRules';

const props = defineProps<{
  id: string;
  /** Whether a password is saved, so an empty password field keeps it. */
  isPasswordSaved: boolean;
  /** The last checks' results, shown under the fields they judged. */
  checks?: SetupChecks;
  /** Folders offered as one-click chips under the download folder. */
  folderSuggestions?: string[];
}>();

const request = defineModel<DownloadClientRequest>('request', { required: true });

const isValid = defineModel<boolean>('isValid', { default: false });

/** qBittorrent's default Web UI address, offered while the field is empty. */
const DEFAULT_URL = 'http://127.0.0.1:8080';

const { t } = useI18n();

const rules = getRules();

/** Downloads are off without an address, so the other fields only matter once one is entered. */
const isTurnedOn = computed<boolean>(() => request.value.url.trim() !== '');

/**
 * Why a check failed, or `null` while there is nothing to report.
 * @param check - The check's result.
 * @returns The translated reason.
 */
const getCheckFailedMessage = (check: SetupCheckResult | undefined): string | null => {
  return check?.ok === false ? t(`setup.checkCodes.${check.code}`, check.params) : null;
};

const connectionFailedMessage = computed<string | null>(() =>
  getCheckFailedMessage(props.checks?.[SettingKey.QBittorrentUrl]),
);
const folderFailedMessage = computed<string | null>(() =>
  getCheckFailedMessage(props.checks?.[SettingKey.DownloadPath]),
);
</script>

<template>
  <base-form v-model:is-valid="isValid" :id="props.id">
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="request.url"
          :label="t('settings.qbittorrentUrl')"
          :placeholder="DEFAULT_URL"
          :rules="rules.url"
        >
          <template #prepend>
            <v-icon icon="mdi-help-circle" v-tooltip:bottom="t('settings.qbittorrentUrlHint')" />
          </template>
        </v-text-field>

        <div class="d-flex flex-wrap ga-2 mt-4 ms-10" v-if="!isTurnedOn">
          <v-chip prepend-icon="mdi-lightbulb-outline" @click="request.url = DEFAULT_URL">{{ DEFAULT_URL }}</v-chip>
        </div>
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field
          v-model="request.username"
          :disabled="!isTurnedOn"
          :label="t('settings.qbittorrentUsername')"
          autocomplete="off"
        >
          <template #prepend>
            <v-icon icon="mdi-help-circle" v-tooltip:bottom="t('settings.qbittorrentLoginHint')" />
          </template>
        </v-text-field>
      </v-col>

      <v-col cols="12" sm="6">
        <password-field
          v-model="request.password"
          :disabled="!isTurnedOn"
          :label="t('settings.qbittorrentPassword')"
          :persistent-placeholder="props.isPasswordSaved"
          :placeholder="props.isPasswordSaved ? t('settings.qbittorrentPasswordSaved') : undefined"
          autocomplete="new-password"
        />
      </v-col>

      <v-col class="pt-0" cols="12" v-if="connectionFailedMessage">
        <v-alert class="ms-10" type="error">{{ connectionFailedMessage }}</v-alert>
      </v-col>

      <v-col cols="12">
        <v-text-field
          v-model="request.downloadPath"
          :disabled="!isTurnedOn"
          :label="t('settings.downloadPath')"
          :rules="rules.downloadPath"
        >
          <template #prepend>
            <v-icon icon="mdi-help-circle" v-tooltip:bottom="t('settings.downloadPathHint')" />
          </template>
        </v-text-field>

        <div class="d-flex flex-wrap ga-2 mt-4 ms-10" v-if="isTurnedOn && props.folderSuggestions?.length">
          <v-chip
            v-for="suggestion in props.folderSuggestions"
            :color="suggestion === request.downloadPath.trim() ? 'link' : undefined"
            prepend-icon="mdi-lightbulb-outline"
            @click="request.downloadPath = suggestion"
            :key="suggestion"
          >
            {{ suggestion }}
          </v-chip>
        </div>
      </v-col>

      <v-col class="pt-0" cols="12" v-if="folderFailedMessage">
        <v-alert class="ms-10" type="error">{{ folderFailedMessage }}</v-alert>
      </v-col>
    </v-row>
  </base-form>
</template>
