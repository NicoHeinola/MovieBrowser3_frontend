<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import { changelogEntries } from '@/data/changelog/changelogEntries';
import { getReleasedChangelogEntries } from '@/utils/changelog/getReleasedChangelogEntries';

/** The newest released version. */
const latestVersion: string | undefined = getReleasedChangelogEntries(changelogEntries)[0]?.version;

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
    v-if="latestVersion"
  >
    v{{ latestVersion }}
  </v-btn>
</template>
