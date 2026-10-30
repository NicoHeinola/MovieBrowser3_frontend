<script setup lang="ts">
import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { Show } from '@/interfaces/api/models/Show';

import { onMounted, ref } from 'vue';
import { BaseDialog } from '@/components/common/base-dialog';
import { BaseForm } from '@/components/common/base-form';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { showCategoryService } from '@/services/show/showCategoryService';
import { showEntryService } from '@/services/show/showEntryService';
import { showEpisodeService } from '@/services/show/showEpisodeService';
import { showLinkService } from '@/services/show/showLinkService';
import { showService } from '@/services/show/showService';
import { showTitleService } from '@/services/show/showTitleService';
import { deepClone } from '@/utils/clone/deepClone';
import { getChangedObject } from '@/utils/object/hasObjectChanged';
import { getSyncPlan } from '@/utils/sync/getSyncPlan';
import { syncItems } from '@/utils/sync/syncItems';
import ShowEntriesFormPart from './ShowEntriesFormPart.vue';
import ShowGeneralFormPart from './ShowGeneralFormPart.vue';
import ShowLinksFormPart from './ShowLinksFormPart.vue';
import ShowUiFormPart from './ShowUiFormPart.vue';

const props = defineProps<DialogComponentProps<boolean>>();

const show = defineModel<Show>('show', { required: true });
const isDialogVisible = defineModel<boolean>({ required: true });

const originalShow = ref<Show | null>(null);
const isFormValid = ref<boolean>(false);
const isSaving = ref<boolean>(false);
/** Set once anything reached the backend, so cancelling after a partial failure still refreshes the caller. */
const hasSavedChanges = ref<boolean>(false);
const selectedTab = ref<string[]>(['general']);

const { confirm } = useConfirmDialog();
const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();

const episodeActionMessages = {
  create: (episodeName: string, entryName: string) => `Added episode "${episodeName}" to entry "${entryName}".`,
  update: (episodeName: string, entryName: string) => `Updated episode "${episodeName}" for entry "${entryName}".`,
  delete: (episodeName: string, entryName: string) => `Removed episode "${episodeName}" from entry "${entryName}".`,
};

const saveShow = async (): Promise<void> => {
  const request = {
    banner_url: show.value.banner_url,
    card_image_url: show.value.card_image_url,
    preview_url: show.value.preview_url,
    description: show.value.description,
  };

  if (!show.value.id) {
    const createdShow = await showService.create(request);

    show.value.id = createdShow.id;
    hasSavedChanges.value = true;
    return;
  }

  const hasShowChanged =
    getChangedObject(originalShow.value, show.value, {
      excludes: ['titles', 'categories', 'entries', 'outgoing_links', 'incoming_links'],
    }) !== undefined;

  if (hasShowChanged) {
    await showService.update(show.value.id, request);
    hasSavedChanges.value = true;
  }
};

const saveCategories = async (): Promise<void> => {
  const selectedCategoryIds = new Set<number>((show.value.categories ?? []).map((category) => category.id));
  const originalCategoryIds = new Set<number>((originalShow.value?.categories ?? []).map((category) => category.id));

  for (const categoryId of selectedCategoryIds) {
    if (!originalCategoryIds.has(categoryId)) {
      await showCategoryService.create(show.value.id, categoryId);
    }
  }

  for (const categoryId of originalCategoryIds) {
    if (!selectedCategoryIds.has(categoryId)) {
      await showCategoryService.remove(show.value.id, categoryId);
    }
  }
};

const saveTitles = async (): Promise<void> => {
  await syncItems(show.value.titles, originalShow.value?.titles ?? [], {
    create: (title) => showTitleService.create(show.value.id, title),
    update: async (id, title) => {
      await showTitleService.update(id, title);
    },
    delete: (id) => showTitleService.remove(id),
  });
};

const saveEntries = async (): Promise<void> => {
  await syncItems(show.value.entries ?? [], originalShow.value?.entries ?? [], {
    compareOptions: { excludes: ['episodes'] },
    create: (entry) => showEntryService.create(show.value.id, entry),
    update: async (id, entry) => {
      await showEntryService.update(id, entry);
    },
    delete: (id) => showEntryService.remove(id),
  });
};

/**
 * Sync episodes per entry after the entries exist, reporting progress because uploads can take a while.
 *
 * @returns Nothing.
 */
const saveEpisodes = async (): Promise<void> => {
  const originalEntries = originalShow.value?.entries ?? [];
  const episodeSyncs = (show.value.entries ?? []).map((entry) => ({
    entry,
    episodes: entry.episodes ?? [],
    originalEpisodes: originalEntries.find((originalEntry) => originalEntry.id === entry.id)?.episodes ?? [],
  }));

  let episodesLeft = episodeSyncs.reduce((amount, { episodes, originalEpisodes }) => {
    const { toCreate, toUpdate, toDelete } = getSyncPlan(episodes, originalEpisodes, 'id');

    return amount + toCreate.length + toUpdate.length + toDelete.length;
  }, 0);

  for (const { entry, episodes, originalEpisodes } of episodeSyncs) {
    await syncItems(episodes, originalEpisodes, {
      create: (episode) => showEpisodeService.create(entry.id, episode),
      update: async (id, episode) => {
        await showEpisodeService.update(id, episode);
      },
      delete: (id) => showEpisodeService.remove(id),
      onItem: (action, episode) => {
        episodesLeft--;
        const message = episodeActionMessages[action](episode.name, entry.name);

        showSuccessSnackbar(`${message} Episodes left: ${episodesLeft}`);
      },
    });
  }
};

const saveLinks = async (): Promise<void> => {
  await syncItems(show.value.outgoing_links ?? [], originalShow.value?.outgoing_links ?? [], {
    create: (link) => showLinkService.create(show.value.id, link),
    update: async (id, link) => {
      await showLinkService.update(id, link);
    },
    delete: (id) => showLinkService.remove(id),
  });
};

/**
 * Saves the show and related data (titles, categories, entries, episodes, links) to the backend.
 * Creates the show first if it's new, then saves each related resource with dedicated helpers.
 *
 * @returns Nothing.
 */
const handleSave = async (): Promise<void> => {
  if (!isFormValid.value) {
    return;
  }

  isSaving.value = true;

  try {
    await saveShow();
    await saveTitles();
    await saveCategories();
    await saveEntries();
    await saveEpisodes();
    await saveLinks();

    showSuccessSnackbar('Show saved successfully.');

    props.close(true);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isSaving.value = false;
  }
};

const deleteShow = async (): Promise<void> => {
  const confirmed = await confirm({
    message: 'Are you sure you want to delete this show? This action cannot be undone.',
    confirmText: 'Delete',
    confirmColor: 'error',
    cancelText: 'Cancel',
  });

  if (!confirmed) {
    return;
  }

  isSaving.value = true;

  try {
    await showService.remove(show.value.id);
    props.close(true);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  /** Snapshot the original values for change detection. */
  if (show.value?.id) {
    originalShow.value = deepClone<Show>(show.value);
  }
});
</script>

<template>
  <base-dialog v-model="isDialogVisible" :max-width="1060">
    <template #title>
      {{ show?.id ? 'Edit Show' : 'Create Show' }}
    </template>

    <template #default>
      <div class="d-flex ga-5 h-100">
        <v-list v-model:selected="selectedTab" class="position-sticky" color="primary" min-width="120px" mandatory>
          <v-list-item title="General" value="general" />
          <v-list-item title="UI" value="ui" />
          <v-list-item title="Entries" value="entries" />
          <v-list-item title="Links" value="links" />
        </v-list>
        <v-divider vertical />
        <base-form
          v-model:is-valid="isFormValid"
          class="w-100 h-100 overflow-scroll"
          style="max-height: 60vh"
          id="show-form"
        >
          <v-tabs-window :model-value="selectedTab[0]" class="flex-1-1">
            <v-tabs-window-item class="pa-1" value="general" eager>
              <show-general-form-part v-model:show="show" />
            </v-tabs-window-item>
            <v-tabs-window-item class="pa-1" value="ui" eager>
              <show-ui-form-part v-model:show="show" />
            </v-tabs-window-item>
            <v-tabs-window-item class="pa-1" value="entries" eager>
              <show-entries-form-part v-model:show="show" />
            </v-tabs-window-item>
            <v-tabs-window-item class="pa-1" value="links" eager>
              <show-links-form-part v-model:outgoing-links="show.outgoing_links" :show-id="show.id" />
            </v-tabs-window-item>
          </v-tabs-window>
        </base-form>
      </div>
    </template>

    <template #actions>
      <v-btn
        :disabled="isSaving"
        color="error"
        prepend-icon="mdi-trash-can"
        variant="text"
        @click="deleteShow"
        v-if="show?.id"
      >
        Delete
      </v-btn>
      <v-spacer />
      <v-btn :disabled="isSaving" variant="text" @click="props.close(hasSavedChanges)"> Cancel </v-btn>
      <v-btn
        :disabled="!isFormValid || isSaving"
        :loading="isSaving"
        color="primary"
        variant="flat"
        @click="handleSave"
      >
        Save
      </v-btn>
    </template>
  </base-dialog>
</template>
