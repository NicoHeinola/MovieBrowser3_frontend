<script setup lang="ts">
import type { UpdateDialogProps } from './updateDialogProps';

import { useI18n } from 'vue-i18n';

import { BaseDialog } from '@/components/common/base-dialog';
import { CopyableCode } from '@/components/common/copyable-code';
import { HeadingText } from '@/components/common/heading-text';

const props = defineProps<UpdateDialogProps>();

/** The command that updates a production install, run on the machine that hosts it. */
const UPDATE_COMMAND = '~/prod_codes/MovieBrowser3/moviebrowser3 update';

const { t } = useI18n();
</script>

<template>
  <base-dialog :model-value="props.modelValue" max-width="520">
    <div class="d-flex flex-column ga-5">
      <div class="d-flex align-center ga-5">
        <v-avatar color="primary" rounded="lg" size="x-large" variant="tonal">
          <v-icon>mdi-update</v-icon>
        </v-avatar>
        <heading-text
          :subtitle="t('update.versionAvailable', { version: props.update.version })"
          :title="t('update.available')"
        />
      </div>

      <div class="d-flex flex-column ga-2">
        <span>{{ t('update.runCommand') }}</span>
        <copyable-code :code="UPDATE_COMMAND" />
      </div>

      <div class="d-flex flex-wrap ga-2" v-if="props.update.backendReleaseUrl || props.update.frontendReleaseUrl">
        <v-btn
          :href="props.update.backendReleaseUrl"
          append-icon="mdi-open-in-new"
          rel="noopener noreferrer"
          target="_blank"
          variant="tonal"
          v-if="props.update.backendReleaseUrl"
        >
          {{ t('update.backendRelease') }}
        </v-btn>
        <v-btn
          :href="props.update.frontendReleaseUrl"
          append-icon="mdi-open-in-new"
          rel="noopener noreferrer"
          target="_blank"
          variant="tonal"
          v-if="props.update.frontendReleaseUrl"
        >
          {{ t('update.frontendRelease') }}
        </v-btn>
      </div>
    </div>

    <template #actions>
      <v-spacer />
      <v-btn color="primary" variant="flat" @click="props.close()">{{ t('common.close') }}</v-btn>
    </template>
  </base-dialog>
</template>
