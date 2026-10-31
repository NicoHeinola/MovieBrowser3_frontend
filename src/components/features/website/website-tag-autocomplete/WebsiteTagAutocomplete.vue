<script setup lang="ts">
import type { WebsiteTag } from '@/interfaces/api/models/WebsiteTag';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';

import { computed, ref, useAttrs, watch } from 'vue';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { WebsiteTagQueryKey } from '@/enums/query/websiteTagQueryKey';
import { websiteTagService } from '@/services/website/websiteTagService';
import { createPendingWebsiteTag } from '@/utils/website/createPendingWebsiteTag';
import { getWebsiteTagSearchState } from '@/utils/website/getWebsiteTagSearchState';
import { isPendingWebsiteTag } from '@/utils/website/isPendingWebsiteTag';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    label?: string;
  }>(),
  {
    label: 'Tags',
  },
);

/** Ids of the selected tags. Pending tags have negative ids. */
const selectedIds = defineModel<number[]>({ required: true });

/** New tags typed in the field. The form creates them on the backend when it saves. */
const pendingTags = defineModel<WebsiteTag[]>('pendingTags', { required: true });

const search = ref<string>('');

const attrs = useAttrs();

const tagsQuery = useAPIQuery<PaginatedResponse<WebsiteTag>>({
  queryKey: [WebsiteTagQueryKey.WebsiteTagAutocomplete],
  queryFn: async () => {
    return await websiteTagService.list({
      sort: 'name',
      page: { number: 0, size: 0 },
    });
  },
  placeholderData: (previousData) => previousData,
});

const tags = computed<WebsiteTag[]>(() => [...(tagsQuery.data.value?.data ?? []), ...pendingTags.value]);
const searchState = computed(() => getWebsiteTagSearchState(search.value, tags.value, selectedIds.value));

const noDataText = computed<string>(() => {
  if (searchState.value.exactMatch) return `“${searchState.value.exactMatch.name}” is already added.`;
  if (tags.value.length > 0) return 'Every tag is already added. Type a name to create one.';
  return 'No tags yet. Type a name to create one.';
});

/**
 * Adds the typed name as a pending tag and selects it.
 * @returns void
 */
const addPendingTag = (): void => {
  if (!searchState.value.canCreate) {
    return;
  }

  const tag = createPendingWebsiteTag(searchState.value.name, pendingTags.value);

  pendingTags.value = [...pendingTags.value, tag];
  selectedIds.value = [...selectedIds.value, tag.id];
  search.value = '';
};

/**
 * Enter selects the tag with exactly the typed name, or adds the name as a new tag when there is none.
 * @returns void
 */
const onEnter = (): void => {
  const { exactMatch } = searchState.value;

  if (!exactMatch) {
    addPendingTag();
    return;
  }

  if (!selectedIds.value.includes(exactMatch.id)) {
    selectedIds.value = [...selectedIds.value, exactMatch.id];
  }

  search.value = '';
};

watch(selectedIds, (ids) => {
  /** A removed pending chip should not linger as a listed tag. */
  if (pendingTags.value.some((tag) => !ids.includes(tag.id))) {
    pendingTags.value = pendingTags.value.filter((tag) => ids.includes(tag.id));
  }
});
</script>

<template>
  <v-autocomplete
    v-model="selectedIds"
    v-model:search="search"
    :items="tags"
    :label="props.label"
    :loading="tagsQuery.isFetching.value"
    hint="Pick tags, or type a new one and press Enter."
    item-title="name"
    item-value="id"
    prepend-inner-icon="mdi-tag-multiple-outline"
    chips
    closable-chips
    hide-selected
    multiple
    persistent-hint
    v-bind="attrs"
    @keydown.enter="onEnter"
  >
    <template #chip="{ props: chipProps, item }">
      <v-chip v-bind="chipProps" :prepend-icon="isPendingWebsiteTag(item) ? 'mdi-plus' : undefined">
        {{ item.name }}
        <v-tooltip activator="parent" location="top" v-if="isPendingWebsiteTag(item)">
          New tag, created when you save
        </v-tooltip>
      </v-chip>
    </template>

    <template #no-data>
      <v-list-item
        :title="`Create tag “${searchState.name}”`"
        base-color="primary"
        prepend-icon="mdi-plus"
        @click="addPendingTag"
        v-if="searchState.canCreate"
      />
      <v-list-item :title="noDataText" disabled v-else />
    </template>

    <template #append-item v-if="searchState.canCreate && searchState.hasVisibleMatches">
      <v-list-item
        :title="`Create tag “${searchState.name}”`"
        base-color="primary"
        prepend-icon="mdi-plus"
        @click="addPendingTag"
      />
    </template>
  </v-autocomplete>
</template>
