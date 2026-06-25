<script setup lang="ts">
import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { Show } from '@/interfaces/api/models/Show';
import type { UpdateShowRequest } from '@/interfaces/api/requests/UpdateShowRequest.ts';

import { onMounted, ref } from 'vue';
import { BaseDialog } from '@/components/common/base-dialog';
import BaseForm from '@/components/common/base-form/BaseForm.vue';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { showEntryService } from '@/services/show/showEntryService';
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

const props = defineProps<DialogComponentProps<Show>>();

const show = defineModel<Show>('show', { required: true });
const originalShow = ref<Show | null>(null);

const isFormValid = ref<boolean>(false);
const isSaving = ref<boolean>(false);

const isDialogVisible = defineModel<boolean>({ required: true });
const selectedTab = ref<string[]>(['general']);

const { showAPIErrorSnackbar } = useCommonSnackbar();

/**
 * Saves the show and related data (entries, links) to the backend.
 * Creates the show first if it's new, then saves entries and links in parallel.
 */
const handleSave = async (): Promise<void> => {
  if (!isFormValid.value) {
    return;
  }

  isSaving.value = true;

  try {
    // Save show itself
    const changedShow = getChangedObject(originalShow.value, show.value, {
      excludes: ['titles'], // Titles are handled separately
    });
    const showNeedsUpdate = show.value.id && changedShow !== undefined;

    console.log('Changed show:', changedShow);

    if (show.value.id) {
      if (showNeedsUpdate) {
        await showService.update(show.value.id, show.value);
      }
    } else {
      const createdShow = await showService.create(show.value);

      show.value.id = createdShow.id;
    }

    // Save titles
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

    originalShow.value = deepClone<Show>(show.value);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  // Clone the show to keep track of original values for comparison
  originalShow.value = deepClone<Show>(show.value);
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
            <v-tabs-window-item class="pa-1" value="general">
              <show-general-tab v-model:show="show" />
            </v-tabs-window-item>
            <v-tabs-window-item class="pa-1" value="ui">
              <show-ui-tab v-model:show="show" />
            </v-tabs-window-item>
            <v-tabs-window-item class="pa-1" value="entries">
              <show-entries-tab v-model:show="show" />
            </v-tabs-window-item>
            <v-tabs-window-item class="pa-1" value="links">
              <show-links-tab v-model:show="show" />
            </v-tabs-window-item>
          </v-tabs-window>
        </base-form>
      </div>
    </template>

    <template #actions>
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
