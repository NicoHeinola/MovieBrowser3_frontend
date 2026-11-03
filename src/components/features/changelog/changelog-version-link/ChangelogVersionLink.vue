<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { getEnvString } from '@/utils/env/getEnvString';

/** The running version, so dev builds of `main` show the upcoming version instead of the last release. */
const appVersion: string = __APP_VERSION__;

/** Text after the version, such as `-dev`. Empty in production. */
const appVersionSuffix: string = getEnvString('VITE_APP_VERSION_SUFFIX', '');

const route = useRoute();
const { t } = useI18n();

/** Whether the changelog page is open, which keeps the link lit. */
const isOnChangelog = computed<boolean>(() => route.name === 'authenticated-changelog');
</script>

<template>
  <v-btn
    :color="isOnChangelog ? 'link' : undefined"
    :to="{ name: 'authenticated-changelog' }"
    :variant="isOnChangelog ? 'text' : 'plain'"
    class="text-none font-weight-regular"
    size="small"
    v-tooltip:bottom="t('nav.changelog')"
  >
    v{{ appVersion }}<span class="text-secondary">{{ appVersionSuffix }}</span>
  </v-btn>
</template>
