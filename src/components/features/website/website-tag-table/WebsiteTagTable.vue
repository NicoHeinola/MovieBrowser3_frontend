<script setup lang="ts">
import type { WebsiteTag } from '@/interfaces/api/models/WebsiteTag';
import type { DataTableHeader } from 'vuetify';

import { useQueryClient } from '@tanstack/vue-query';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useDataTableSort } from '@/composables/table/useDataTableSort';
import { WebsiteQueryKey } from '@/enums/query/websiteQueryKey';
import { WebsiteTagQueryKey } from '@/enums/query/websiteTagQueryKey';
import { websiteTagService } from '@/services/website/websiteTagService';
import { getQueryKeyFilter } from '@/utils/query/getQueryKeyFilter';
import { getWebsiteTagRename } from '@/utils/website/tag/getWebsiteTagRename';

const props = defineProps<{
  /** The current page of tags, searched, sorted and paged by the backend; the parent's pagination picks the page. */
  tags: WebsiteTag[];
  /** Shows a placeholder instead of the table, for the first load. */
  isPending: boolean;
  /** Shows the table's loading bar while another page, sort or search loads. */
  loading: boolean;
  /** Whether a search term is set, for the empty table's text. */
  isSearching: boolean;
}>();

/** Backend sort: `name`, or `-name` for descending. */
const sort = defineModel<string>('sort', { required: true });

const emit = defineEmits<{
  /** The websites count of a tag was clicked, to list the websites using it. */
  'click:websites': [tagId: number];
}>();

/** Names being edited, by tag id. A tag without an entry shows its saved name. */
const editedNames = ref<Record<number, string>>({});
const busyTagId = ref<number | null>(null);

const { confirm } = useConfirmDialog();
const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();
const queryClient = useQueryClient();
const { t } = useI18n();
const { sortBy } = useDataTableSort(sort, { name: 'name' });

const headers = computed<DataTableHeader[]>(() => [
  { title: t('website.colName'), key: 'name' },
  { title: t('website.colWebsites'), key: 'websites_count', align: 'end', sortable: false, width: 140 },
  { title: '', key: 'actions', align: 'end', sortable: false, width: 72 },
]);

const items = computed<Array<{ id: number; name: string; websites_count: number }>>(() => {
  return props.tags.map((tag) => ({
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
const getUsageLabel = (count: number): string => t('website.websiteCount', { count }, count);

/**
 * Reloads every tag list and the websites, which show tag names.
 * @returns Nothing.
 */
const invalidateTagsAndWebsites = async (): Promise<void> => {
  await queryClient.invalidateQueries(getQueryKeyFilter(WebsiteTagQueryKey, WebsiteQueryKey));
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
    showSuccessSnackbar(t('website.tagRenamed', { name }));
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
  const confirmed = await confirm({
    message:
      tag.websites_count > 0
        ? t('website.deleteTagConfirmUsed', { name: tag.name, usage: getUsageLabel(tag.websites_count) })
        : t('website.deleteTagConfirm', { name: tag.name }),
    confirmText: t('common.delete'),
    confirmColor: 'error',
    cancelText: t('common.cancel'),
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
</script>

<template>
  <v-skeleton-loader type="table-tbody" v-if="props.isPending" />
  <v-data-table-server
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="items"
    :items-length="props.tags.length"
    :items-per-page="-1"
    :loading="props.loading || busyTagId !== null"
    class="tag-table"
    hide-default-footer
    hover
    must-sort
    v-else
  >
    <template #item.name="{ item }">
      <v-text-field
        :aria-label="t('website.tagNameOf', { name: item.name })"
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
        v-tooltip:bottom="t('website.deleteTag')"
      />
    </template>

    <template #no-data>
      {{ props.isSearching ? t('website.noTagsMatch') : t('website.noTagsAdd') }}
    </template>
  </v-data-table-server>
</template>
