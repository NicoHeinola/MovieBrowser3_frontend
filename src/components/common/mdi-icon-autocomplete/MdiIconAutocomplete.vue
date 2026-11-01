<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { loadMdiIconCatalogue } from './loadMdiIconCatalogue';

const { t } = useI18n();

const props = withDefaults(
  defineProps<{
    label?: string;
    maxResults?: number;
    placeholder?: string;
    rules?: Array<(value: string) => boolean | string>;
  }>(),
  {
    label: undefined,
    maxResults: 120,
    placeholder: '',
    rules: () => [],
  },
);

const selectedIcon = defineModel<string>({
  default: '',
});

const search = ref<string>('');
const allIcons = ref<string[]>([]);
const isLoading = ref<boolean>(false);

type MdiIconAutocompleteItem = {
  title: string;
  value: string;
  props: {
    prependIcon: string;
    title: string;
  };
};

const toIconItem = (iconName: string): MdiIconAutocompleteItem => {
  return {
    title: iconName,
    value: iconName,
    props: {
      prependIcon: iconName,
      title: iconName,
    },
  };
};

const loadIcons = async (): Promise<void> => {
  if (allIcons.value.length > 0 || isLoading.value) {
    return;
  }

  isLoading.value = true;

  try {
    allIcons.value = await loadMdiIconCatalogue();
  } finally {
    isLoading.value = false;
  }
};

const filteredIcons = computed<string[]>(() => {
  const normalizedSearch = search.value.trim().toLowerCase();

  if (!normalizedSearch) {
    const initialItems = allIcons.value.slice(0, props.maxResults);

    if (
      selectedIcon.value &&
      !initialItems.includes(selectedIcon.value) &&
      allIcons.value.includes(selectedIcon.value)
    ) {
      return [selectedIcon.value, ...initialItems.slice(0, props.maxResults - 1)];
    }

    return initialItems;
  }

  const startsWithMatches: string[] = [];
  const includesMatches: string[] = [];

  for (const iconName of allIcons.value) {
    const normalizedName = iconName.toLowerCase();

    if (normalizedName.startsWith(normalizedSearch)) {
      startsWithMatches.push(iconName);
      continue;
    }

    if (normalizedName.includes(normalizedSearch)) {
      includesMatches.push(iconName);
    }

    if (startsWithMatches.length + includesMatches.length >= props.maxResults) {
      break;
    }
  }

  return [...startsWithMatches, ...includesMatches].slice(0, props.maxResults);
});

const autocompleteItems = computed<MdiIconAutocompleteItem[]>(() => {
  return filteredIcons.value.map((iconName) => toIconItem(iconName));
});

const noDataText = computed<string>(() => {
  if (isLoading.value) {
    return t('iconSearch.loading');
  }

  if (allIcons.value.length === 0) {
    return t('iconSearch.openToLoad');
  }

  if (search.value.trim()) {
    return t('iconSearch.noMatch');
  }

  return t('iconSearch.showingFirst', { count: props.maxResults });
});
</script>

<template>
  <v-autocomplete
    v-model="selectedIcon"
    v-model:search="search"
    :items="autocompleteItems"
    :label="props.label ?? t('common.iconLabel')"
    :loading="isLoading"
    :no-data-text="noDataText"
    :placeholder="props.placeholder"
    :rules="props.rules"
    item-title="title"
    item-value="value"
    no-filter
    @focus="void loadIcons()"
  >
    <template #selection="{ item }">
      <div class="d-flex align-center ga-2" v-if="item">
        <v-icon :icon="selectedIcon" />
        <span class="text-truncate">{{ item.title || item }}</span>
      </div>
    </template>
  </v-autocomplete>
</template>
