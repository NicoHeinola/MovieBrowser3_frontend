<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { languageFlagCountries } from '@/data/torrent/languageFlagCountries';
import 'flag-icons/css/flag-icons.min.css';

const props = defineProps<{
  /** Language codes as nekoBT writes them, such as `ja` or `es-419`. */
  codes: string[];
  /** Icon in front of the flags, such as an audio or subtitle icon. */
  icon: string;
  /** What the languages are, shown on hover with their names. */
  label: string;
}>();

/** Flags shown before the rest collapse into a "+3", so a release with every subtitle stays on one line. */
const MAX_FLAGS = 8;

const { locale } = useI18n();

const languageNames = computed<Intl.DisplayNames>(() => new Intl.DisplayNames([locale.value], { type: 'language' }));

/**
 * Names a language code in the app language, such as "Latin American Spanish" for `es-419`.
 * @param code - The language code.
 * @returns The name, or the code when the browser doesn't know it.
 */
const getLanguageName = (code: string): string => {
  try {
    return languageNames.value.of(code) ?? code;
  } catch {
    // Codes the browser can't parse throw instead of returning undefined
    return code;
  }
};

/** Each language's flag country, or null to show its code instead, with its name in the app language. */
const languages = computed<{ code: string; country: string | null; name: string }[]>(() =>
  props.codes.map((code) => ({ code, country: languageFlagCountries[code] ?? null, name: getLanguageName(code) })),
);

const tooltip = computed<string>(
  () => `${props.label}: ${languages.value.map((language) => language.name).join(', ')}`,
);
</script>

<template>
  <span :title="tooltip" class="d-inline-flex align-center ga-2">
    <i :class="props.icon" class="mdi" />
    <template v-for="language in languages.slice(0, MAX_FLAGS)" :key="language.code">
      <span :class="`fi fi-${language.country}`" class="rounded-sm" v-if="language.country" />
      <span class="text-label-small font-weight-bold" v-else>{{ language.code.toUpperCase() }}</span>
    </template>
    <span v-if="languages.length > MAX_FLAGS">+{{ languages.length - MAX_FLAGS }}</span>
  </span>
</template>
