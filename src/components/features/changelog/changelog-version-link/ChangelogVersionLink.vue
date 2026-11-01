<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import { changelogEntries } from '@/data/changelog/changelogEntries';

/** The newest released version. */
const latestVersion: string | undefined = changelogEntries[0]?.version;

const route = useRoute();

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
    v-tooltip:bottom="'Changelog'"
    v-if="latestVersion"
  >
    v{{ latestVersion }}
  </v-btn>
</template>
