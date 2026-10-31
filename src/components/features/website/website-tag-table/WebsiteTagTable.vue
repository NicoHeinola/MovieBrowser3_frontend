<script setup lang="ts">
import type { WebsiteTag } from '@/interfaces/api/models/WebsiteTag';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import type { DataTableHeader } from 'vuetify';

import { useQueryClient } from '@tanstack/vue-query';
import { watchDebounced } from '@vueuse/core';
import { computed, ref, watch } from 'vue';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { WebsiteQueryKey } from '@/enums/query/websiteQueryKey';
import { WebsiteTagQueryKey } from '@/enums/query/websiteTagQueryKey';
import { websiteTagService } from '@/services/website/websiteTagService';
import { getWebsiteTagListQuery } from '@/utils/website/getWebsiteTagListQuery';
import { getWebsiteTagRename } from '@/utils/website/getWebsiteTagRename';

const props = withDefaults(
  defineProps<{
    /** Words the tag names must all contain. Changes are debounced before searching the backend. */
    search?: string | null;
  }>(),
  {
    search: '',
  },
);

const emit = defineEmits<{
  /** The websites count of a tag was clicked, to list the websites using it. */
  'click:websites': [tagId: number];
}>();

const searchTerm = ref<string>('');
const page = ref<number>(1);
/** -1 shows every tag on one page. */
const itemsPerPage = ref<number>(-1);
const sortBy = ref<Array<{ key: string; order?: boolean | 'asc' | 'desc' }>>([{ key: 'name', order: 'asc' }]);
/** Names being edited, by tag id. A tag without an entry shows its saved name. */
const editedNames = ref<Record<number, string>>({});
const busyTagId = ref<number | null>(null);

const { confirm } = useConfirmDialog();
const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
const queryClient = useQueryClient();

const headers: Array<DataTableHeader> = [
  { title: 'Name', key: 'name' },
  { title: 'Websites', key: 'websites_count', align: 'end', sortable: false, width: 140 },
  { title: '', key: 'actions', align: 'end', sortable: false, width: 72 },
];

const itemsPerPageOptions = [
  { value: 25, title: '25' },
  { value: 50, title: '50' },
  { value: 100, title: '100' },
  { value: -1, title: 'All' },
];

/** Searched, sorted and paged on the backend, so the table scales with the tag count. */
const tagsQuery = useAPIQuery<PaginatedResponse<WebsiteTag>>({
  queryKey: [WebsiteTagQueryKey.AdminWebsiteTags, searchTerm, page, itemsPerPage, sortBy],
  queryFn: async () => {
    return await websiteTagService.list(
      getWebsiteTagListQuery(searchTerm.value, page.value, itemsPerPage.value, sortBy.value),
    );
  },
  placeholderData: (previousData) => previousData,
});

const totalTags = computed<number>(() => tagsQuery.data.value?.meta.total ?? 0);

const items = computed<Array<{ id: number; name: string; websites_count: number }>>(() => {
  return (tagsQuery.data.value?.data ?? []).map((tag) => ({
    id: tag.id,
    name: tag.name,
    websites_count: tag.websites_count ?? 0,
  }));
});

/**
 * Describes how many websites use a tag.
 * @param count - The websites count.
 * @returns For example "3 websites".
 */
const getUsageLabel = (count: number): string => `${count} website${count === 1 ? '' : 's'}`;

/**
 * Reloads every tag list and the websites, which show tag names.
 * @returns Nothing.
 */
const invalidateTagsAndWebsites = async (): Promise<void> => {
  await Promise.all(
    [...Object.values(WebsiteTagQueryKey), ...Object.values(WebsiteQueryKey)].map((queryKey) =>
      queryClient.invalidateQueries({ queryKey: [queryKey] }),
    ),
  );
};

/**
 * Forgets an edited name so the field shows the saved one again.
 * @param tagId - The tag id.
 * @returns void
 */
const resetName = (tagId: number): void => {
  editedNames.value = Object.fromEntries(
    Object.entries(editedNames.value).filter(([editedTagId]) => Number(editedTagId) !== tagId),
  );
};

/**
 * Ends editing on Enter; the blur then saves the name.
 * @param event - The key event.
 * @returns void
 */
const blurField = (event: KeyboardEvent): void => {
  (event.target as HTMLElement | null)?.blur();
};

/**
 * Saves an edited tag name. Blank or unchanged names are reverted without a request.
 * @param tag - The tag row.
 * @param tag.id - The tag id.
 * @param tag.name - The saved name.
 * @returns Nothing.
 */
const saveName = async (tag: { id: number; name: string }): Promise<void> => {
  const name = getWebsiteTagRename(tag.name, editedNames.value[tag.id]);

  if (!name || busyTagId.value !== null) {
    resetName(tag.id);
    return;
  }

  busyTagId.value = tag.id;

  try {
    await websiteTagService.update(tag.id, { name });
    await invalidateTagsAndWebsites();
    showSuccessSnackbar(`Tag renamed to “${name}”.`);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    resetName(tag.id);
    busyTagId.value = null;
  }
};

/**
 * Deletes a tag after confirming. Its websites stay; they only lose the tag.
 * @param tag - The tag row.
 * @param tag.id - The tag id.
 * @param tag.name - The tag name.
 * @param tag.websites_count - How many websites use the tag.
 * @returns Nothing.
 */
const confirmDelete = async (tag: { id: number; name: string; websites_count: number }): Promise<void> => {
  const usage = tag.websites_count > 0 ? ` It is removed from ${getUsageLabel(tag.websites_count)}.` : '';
  const confirmed = await confirm({
    message: `Delete the tag “${tag.name}”?${usage} This action cannot be undone.`,
    confirmText: 'Delete',
    confirmColor: 'error',
    cancelText: 'Cancel',
  });

  if (!confirmed) {
    return;
  }

  busyTagId.value = tag.id;

  try {
    await websiteTagService.remove(tag.id);
    await invalidateTagsAndWebsites();
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    resetName(tag.id);
    busyTagId.value = null;
  }
};
watch(
  () => tagsQuery.data.value?.meta.last_page,
  (lastPage) => {
    /** Step back when deleting the last tag of the last page leaves it empty. */
    if (lastPage && page.value > lastPage) {
      page.value = lastPage;
    }
  },
);

watchDebounced(
  () => props.search,
  (value) => {
    searchTerm.value = (value ?? '').trim();
    page.value = 1;
  },
  { debounce: 300 },
);
</script>

<template>
  <v-skeleton-loader type="table-tbody" v-if="tagsQuery.isPending.value" />
  <v-data-table-server
    v-model:items-per-page="itemsPerPage"
    v-model:page="page"
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="items"
    :items-length="totalTags"
    :items-per-page-options="itemsPerPageOptions"
    :loading="tagsQuery.isFetching.value || busyTagId !== null"
    class="tag-table"
    hover
    must-sort
    v-else
  >
    <template #item.name="{ item }">
      <v-text-field
        :aria-label="`Name of tag ${item.name}`"
        :disabled="busyTagId !== null && busyTagId !== item.id"
        :model-value="editedNames[item.id] ?? item.name"
        prepend-inner-icon="mdi-pencil-outline"
        variant="plain"
        @blur="saveName(item)"
        @keydown.enter="blurField"
        @keydown.esc="resetName(item.id)"
        @update:model-value="editedNames = { ...editedNames, [item.id]: $event }"
      />
    </template>

    <template #item.websites_count="{ item }">
      <v-btn
        :disabled="item.websites_count === 0"
        color="link"
        size="small"
        variant="text"
        @click="emit('click:websites', item.id)"
      >
        {{ getUsageLabel(item.websites_count) }}
      </v-btn>
    </template>

    <template #item.actions="{ item }">
      <v-btn
        :disabled="busyTagId !== null"
        color="error"
        icon="mdi-trash-can-outline"
        size="small"
        variant="text"
        @click="confirmDelete(item)"
        v-tooltip:bottom="'Delete tag'"
      />
    </template>

    <template #no-data>
      {{ searchTerm ? 'No tags match this search.' : 'No tags yet. Add one with the + button.' }}
    </template>
  </v-data-table-server>
</template>
