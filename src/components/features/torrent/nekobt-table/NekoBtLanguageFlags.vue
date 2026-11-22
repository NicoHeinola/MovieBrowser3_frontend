<script setup lang="ts">
import { computed } from 'vue';

import { languageFlagCountries } from '@/data/torrent/languageFlagCountries';
import 'flag-icons/css/flag-icons.min.css';

const props = defineProps<{
  /** Language codes as nekoBT writes them, such as `ja` or `es-419`. */
  codes: string[];
  /** Icon in front of the flags, such as an audio or subtitle icon. */
  icon: string;
}>();

/** Flags shown before the rest collapse into a "+3", so a release with every subtitle stays on one line. */
const MAX_FLAGS = 8;

/** Each language's flag country, or null to show its code instead. */
const languages = computed<{ code: string; country: string | null }[]>(() =>
  props.codes.map((code) => ({ code, country: languageFlagCountries[code] ?? null })),
);
</script>

<template>
  <span class="d-inline-flex align-center ga-2">
    <i :class="props.icon" class="mdi" />
    <template v-for="language in languages.slice(0, MAX_FLAGS)" :key="language.code">
      <span :class="`fi fi-${language.country}`" class="rounded-sm" v-if="language.country" />
      <span class="text-label-small font-weight-bold" v-else>{{ language.code.toUpperCase() }}</span>
    </template>
    <span v-if="languages.length > MAX_FLAGS">+{{ languages.length - MAX_FLAGS }}</span>
  </span>
</template>
