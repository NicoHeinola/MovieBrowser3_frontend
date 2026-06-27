<script setup lang="ts">
import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { Show } from '@/interfaces/api/models/Show';

import { onMounted, ref } from 'vue';
import { BaseDialog } from '@/components/common/base-dialog';
import BaseForm from '@/components/common/base-form/BaseForm.vue';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog.ts';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { showEntryService } from '@/services/show/showEntryService';
import { showEpisodeService } from '@/services/show/showEpisodeService.ts';
import { showLinkService } from '@/services/show/showLinkService';
import { showService } from '@/services/show/showService';
import { showTitleService } from '@/services/show/showTitleService.ts';
import { deepClone } from '@/utils/clone/deepClone.ts';
import { getChangedObject } from '@/utils/object/hasObjectChanged.ts';
import { syncItems } from '@/utils/sync/syncItems.ts';
import ShowEntriesTab from './ShowEntriesTab.vue';
import ShowGeneralTab from './ShowGeneralTab.vue';
import ShowLinksTab from './ShowLinksTab.vue';
import ShowUiTab from './ShowUiTab.vue';

const props = defineProps<DialogComponentProps<boolean>>();

const show = defineModel<Show>('show', { required: true });
const originalShow = ref<Show | null>(null);

const { confirm } = useConfirmDialog();

const isFormValid = ref<boolean>(false);
const isSaving = ref<boolean>(false);

const isDialogVisible = defineModel<boolean>({ required: true });
const selectedTab = ref<string[]>(['general']);

const { showAPIErrorSnackbar, showSuccessSnackbar } = useCommonSnackbar();

const saveShow = async (): Promise<void> => {
  const changedShow = getChangedObject(originalShow.value, show.value, {
    excludes: ['titles', 'links', 'entries'],
  });
  const showNeedsUpdate = show.value.id && changedShow !== undefined;

  if (show.value.id) {
    if (showNeedsUpdate) {
      await showService.update(show.value.id, show.value);
    }
  } else {
    const createdShow = await showService.create(show.value);

    show.value.id = createdShow.id;
  }
};

const saveTitles = async (): Promise<void> => {
  const haveTitlesChanged =
    getChangedObject(
      originalShow.value ? Array.from(originalShow.value.titles.values()) : [],
      Array.from(show.value.titles.values()),
    ) !== undefined;

  if (!haveTitlesChanged) {
    return;
  }

  await syncItems(
    Array.from(show.value.titles.values()),
    originalShow.value ? Array.from(originalShow.value.titles.values()) : [],
    {
      create: (title) => showTitleService.create(show.value.id, title),
      update: async (id, title) => {
        await showTitleService.update(id, title);
      },
      delete: (id) => showTitleService.remove(id),
    },
  );
};

const saveEntries = async (): Promise<void> => {
  const haveEntriesChanged =
    getChangedObject(originalShow.value?.entries ?? [], show.value.entries ?? []) !== undefined;

  if (!haveEntriesChanged) {
    return;
  }

  const originalEntries = originalShow.value?.entries ?? [];
  let episodesToSyncAmount = (show.value.entries ?? []).reduce((amount, entry) => {
    const originalEntry = originalEntries.find((originalEntry) => originalEntry.id === entry.id);
    const haveEpisodesChanged = getChangedObject(originalEntry?.episodes ?? [], entry.episodes ?? []) !== undefined;

    if (!haveEpisodesChanged) {
      return amount;
    }

    const currentEpisodes = entry.episodes ?? [];
    const deletedEpisodesCount = (originalEntry?.episodes ?? []).filter(
      (originalEpisode) => !currentEpisodes.some((episode) => episode.id === originalEpisode.id),
    ).length;

    return amount + currentEpisodes.length + deletedEpisodesCount;
  }, 0);

  await syncItems(show.value.entries ?? [], originalEntries, {
    create: (entry) => showEntryService.create(show.value.id, entry),
    update: async (id, entry) => {
      await showEntryService.update(id, entry);
    },
    delete: (id) => showEntryService.remove(id),
    onItem: async (action, item) => {
      if (action === 'delete') {
        return;
      }

      const haveEpisodesChanged =
        getChangedObject(
          originalShow.value?.entries?.find((e) => e.id === item.id)?.episodes ?? [],
          item.episodes ?? [],
        ) !== undefined;

      if (haveEpisodesChanged) {
        await syncItems(
          item.episodes ?? [],
          originalShow.value?.entries?.find((e) => e.id === item.id)?.episodes ?? [],
          {
            create: (episode) => showEpisodeService.create(item.id, episode),
            update: async (id, episode) => {
              await showEpisodeService.update(id, episode);
            },
            delete: (id) => showEpisodeService.remove(id),
            onItem: async (action, episode) => {
              episodesToSyncAmount--;

              switch (action) {
                case 'create': {
                  showSuccessSnackbar(
                    `Added episode "${episode.name}" to entry "${item.name}". Episodes left: ${episodesToSyncAmount}`,
                  );

                  break;
                }
                case 'update': {
                  showSuccessSnackbar(
                    `Updated episode "${episode.name}" for entry "${item.name}". ` +
                      `Episodes left: ${episodesToSyncAmount}`,
                  );

                  break;
                }
                case 'delete': {
                  showSuccessSnackbar(
                    `Removed episode "${episode.name}" from entry "${item.name}". ` +
                      `Episodes left: ${episodesToSyncAmount}`,
                  );

                  break;
                }
              }
            },
          },
        );
      }
    },
  });
};

const saveLinks = async (): Promise<void> => {
  const haveLinksChanged =
    getChangedObject(originalShow.value?.outgoing_links ?? [], show.value.outgoing_links ?? []) !== undefined;

  if (!haveLinksChanged) {
    return;
  }

  await syncItems(show.value.outgoing_links ?? [], originalShow.value?.outgoing_links ?? [], {
    create: (link) => showLinkService.create(show.value.id, link),
    update: async (id, link) => {
      await showLinkService.update(id, link);
    },
    delete: (id) => showLinkService.deleteLink(id),
  });
};

/**
 * Saves the show and related data (entries, links) to the backend.
 * Creates the show first if it's new, then saves each related resource with dedicated helpers.
 */
const handleSave = async (): Promise<void> => {
  if (!isFormValid.value) {
    return;
  }

  isSaving.value = true;

  try {
    await saveShow();
    await saveTitles();
    await saveEntries();
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
  // Clone the show to keep track of original values for comparison
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
        <base-form v-model="isFormValid" class="w-100 h-100 overflow-scroll" style="max-height: 60vh" id="show-form">
          <v-tabs-window :model-value="selectedTab[0]" class="flex-1-1">
            <v-tabs-window-item class="pa-1" value="general" eager>
              <show-general-tab v-model:show="show" />
            </v-tabs-window-item>
            <v-tabs-window-item class="pa-1" value="ui" eager>
              <show-ui-tab v-model:show="show" />
            </v-tabs-window-item>
            <v-tabs-window-item class="pa-1" value="entries" eager>
              <show-entries-tab v-model:show="show" />
            </v-tabs-window-item>
            <v-tabs-window-item class="pa-1" value="links" eager>
              <show-links-tab v-model:show="show" />
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
      <v-btn :disabled="isSaving" variant="text" @click="props.close()"> Cancel </v-btn>
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
