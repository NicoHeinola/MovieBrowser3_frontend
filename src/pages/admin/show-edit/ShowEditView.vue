<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import { computed, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';

import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import {
  ShowEditor,
  ShowEditorHero,
  ShowEditorSaveBar,
  ShowEditorSkeleton,
} from '@/components/features/show/show-editor';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useShowEditor } from '@/composables/show/useShowEditor';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';

const editor = useTemplateRef<InstanceType<typeof ShowEditor>>('editor');

const route = useRoute();
const router = useRouter();
const { confirm } = useConfirmDialog();
const { showWarningSnackbar } = useCommonSnackbar();
const { t } = useI18n();

/** The edited show's id from the URL, or null on the page for adding a show. */
const showId = computed<number | null>(() => (route.name === 'admin-show-edit' ? Number(route.params.showId) : null));

const { show, isLoading, isLoadError, isSaving, isDeleting, hasChanges, episodeProgress, save, remove, discard } =
  useShowEditor(showId);

/**
 * Returns to the page the editor was opened from, such as the show list with its filters, or to the show list when
 * the editor was opened directly.
 * @returns Nothing.
 */
const goBack = async (): Promise<void> => {
  // Vue Router keeps the previous in-app URL in the history state; without one, going back would leave the app.
  if (window.history.state?.back) {
    router.back();
    return;
  }

  await router.push({ name: 'admin-shows' });
};

/**
 * Validates and saves the show. A new show moves to its own edit URL, so a reload opens it again.
 * @returns Nothing.
 */
const saveShow = async (): Promise<void> => {
  if (isSaving.value || !hasChanges.value) {
    return;
  }

  if (!(await editor.value?.validate())) {
    showWarningSnackbar(t('showEditor.fixErrors'));
    return;
  }

  const wasNew = showId.value === null;
  const savedId = await save();

  if (savedId !== null && wasNew) {
    await router.replace({ name: 'admin-show-edit', params: { showId: savedId } });
  }
};

/**
 * Throws away unsaved changes after the user confirms.
 * @returns Nothing.
 */
const discardChanges = async (): Promise<void> => {
  const isConfirmed = await confirm({
    message: t('showEditor.discardConfirm'),
    confirmText: t('showEditor.discard'),
    confirmColor: 'error',
    cancelText: t('common.cancel'),
  });

  if (isConfirmed) {
    discard();
  }
};

/**
 * Deletes the show and leaves the editor.
 * @returns Nothing.
 */
const deleteShow = async (): Promise<void> => {
  if (await remove()) {
    await goBack();
  }
};

onBeforeRouteLeave(async () => {
  // A running save still counts as unsaved: if it fails after the user left, the edits would be gone. A new show's
  // switch to its edit URL passes, because the save has reloaded the draft by then.
  if (!hasChanges.value) {
    return true;
  }

  return await confirm({
    message: t('showEditor.leaveConfirm'),
    confirmText: t('showEditor.leave'),
    confirmColor: 'error',
    cancelText: t('showEditor.stay'),
  });
});

// Reloading or closing the tab would lose unsaved changes too, so the browser asks first.
useEventListener(window, 'beforeunload', (event: BeforeUnloadEvent) => {
  if (hasChanges.value) {
    event.preventDefault();
  }
});

// Ctrl+S (Cmd+S on a Mac) saves, like in any editor, instead of saving the web page.
useEventListener(window, 'keydown', (event: KeyboardEvent) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    void saveShow();
  }
});
</script>

<template>
  <page-background />

  <page-container class="pb-16">
    <div class="d-flex flex-column ga-6 pb-16">
      <div>
        <v-btn prepend-icon="mdi-arrow-left" variant="text" @click="void goBack()">
          {{ t('showEditor.back') }}
        </v-btn>
      </div>

      <v-alert class="flex-0-1 align-self-center" type="error" v-if="isLoadError">
        {{ t('showEditor.loadFailed') }}
      </v-alert>

      <show-editor-skeleton v-else-if="isLoading || !show" />

      <template v-else>
        <show-editor-hero
          :disabled="isSaving || isDeleting"
          :is-deleting="isDeleting"
          :show="show"
          @delete="void deleteShow()"
        />
        <show-editor v-model:show="show" ref="editor" />
      </template>
    </div>
  </page-container>

  <show-editor-save-bar
    :episode-progress="episodeProgress"
    :has-changes="hasChanges"
    :is-deleting="isDeleting"
    :is-new="showId === null"
    :is-saving="isSaving"
    @discard="void discardChanges()"
    @save="void saveShow()"
    v-if="show"
  />
</template>
