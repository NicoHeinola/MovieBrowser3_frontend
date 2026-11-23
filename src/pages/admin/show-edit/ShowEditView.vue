<script setup lang="ts">
import type { Download } from '@/interfaces/api/models/Download';
import type { ShowTemplate } from '@/interfaces/api/models/ShowTemplate';
import { useEventListener } from '@vueuse/core';
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';

import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { AddTorrentDialog } from '@/components/features/download/add-torrent-dialog';
import {
  ShowEditor,
  ShowEditorHero,
  ShowEditorSaveBar,
  ShowEditorSkeleton,
} from '@/components/features/show/show-editor';
import { ShowTemplateDialog } from '@/components/features/show/show-template-dialog';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useVideoDurationScan } from '@/composables/setting/useVideoDurationScan';
import { useShowEditor } from '@/composables/show/useShowEditor';
import { useShowTemplate } from '@/composables/show/useShowTemplate';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { DownloadStatus } from '@/enums/download/DownloadStatus';
import { DownloadQueryKey } from '@/enums/query/downloadQueryKey';
import { downloadService } from '@/services/download/downloadService';
import { getQueryString } from '@/utils/route/getQueryString';
import { hasPendingVideoUploads } from '@/utils/show/video-file/hasPendingVideoUploads';

const editor = useTemplateRef<InstanceType<typeof ShowEditor>>('editor');

/** The page link the new show was last filled in from, or the one it was opened with, for the link dialog. */
const templateUrl = ref<string>('');
/** Whether the user has left the page, so a template that finishes loading afterwards isn't filled in. */
let hasLeftPage = false;

const route = useRoute();
const router = useRouter();
const { confirm } = useConfirmDialog();
const dialog = useDialog();
const { showSuccessSnackbar, showWarningSnackbar } = useCommonSnackbar();
const { t } = useI18n();

/** The edited show's id from the URL, or null on the page for adding a show. */
const showId = computed<number | null>(() => (route.name === 'admin-show-edit' ? Number(route.params.showId) : null));

const {
  show,
  isLoading,
  isLoadError,
  isSaving,
  isDeleting,
  hasChanges,
  episodeProgress,
  save,
  remove,
  discard,
  applyTemplate,
} = useShowEditor(showId);
const { isLoading: isLoadingTemplate, loadTemplate } = useShowTemplate();

/** The download the editor was opened with (a torrent's "Add to show"), whose files can be picked for episodes. */
const downloadId = computed<number | null>(() => {
  const id = Number(getQueryString(route.query.download));

  return Number.isInteger(id) && id > 0 ? id : null;
});

const downloadQuery = useAPIQuery<Download>({
  queryKey: computed(() => [DownloadQueryKey.ShowEditorDownload, downloadId.value]),
  queryFn: async () => await downloadService.get(downloadId.value!),
  enabled: computed(() => downloadId.value !== null),
  // A magnet's file list comes from peers first, so look again until qBittorrent has it
  refetchInterval: (query) => (query.state.data?.status === DownloadStatus.FetchingMetadata ? 2000 : false),
  staleTime: 0,
});

const {
  isRunning: isReadingLengths,
  isStarting: isStartingLengthScan,
  followQueuedScan: followLengthScan,
  startScan: startLengthScan,
} = useVideoDurationScan();

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
  // Read before saving: a save clears the picked files once they're uploaded
  const hasUploads = show.value !== null && hasPendingVideoUploads(show.value);
  const savedId = await save();

  // Uploaded files queue a length scan on the backend; follow it so their lengths show once read
  if (savedId !== null && hasUploads) {
    void followLengthScan();
  }

  // The download's status follows its picks, which the save just sent
  if (savedId !== null && downloadId.value !== null) {
    void downloadQuery.refetch();
  }

  // The download stays in the URL, so more of its files can still be picked
  if (savedId !== null && wasNew) {
    const query = route.query.download ? { download: route.query.download } : {};

    await router.replace({ name: 'admin-show-edit', params: { showId: savedId }, query });
  }
};

/**
 * Queues this show's episodes for a length read in the background; the hero shows the scan while it runs.
 * @returns Nothing.
 */
const readLengths = async (): Promise<void> => {
  if (show.value?.id) {
    await startLengthScan({ showIds: [show.value.id] });
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
 * Fills the new show in from a template, after the user agrees to replace what they've typed so far, and says which
 * genres had no category to pick.
 * @param template - The template.
 * @returns Nothing.
 */
const fillFromTemplate = async (template: ShowTemplate): Promise<void> => {
  const isReplacing =
    !hasChanges.value ||
    (await confirm({
      message: t('showEditor.template.replaceConfirm'),
      confirmText: t('showEditor.template.replace'),
      confirmColor: 'warning',
      cancelText: t('common.cancel'),
    }));

  if (!isReplacing) {
    return;
  }

  applyTemplate(template);
  templateUrl.value = template.source_url;

  showSuccessSnackbar(t('showEditor.template.filled'));

  // Genres no category matches are left out of the show, so they get their own warning to act on
  if (template.unmatched_genres.length > 0) {
    showWarningSnackbar(t('showEditor.template.unmatchedGenres', { genres: template.unmatched_genres.join(', ') }));
  }
};

/**
 * Asks for a page link and fills the new show in from it.
 * @returns Nothing.
 */
const openTemplateDialog = async (): Promise<void> => {
  const template = await dialog.showDialog<ShowTemplate, Record<string, unknown>>({
    component: ShowTemplateDialog,
    props: { initialUrl: templateUrl.value },
  });

  if (template) {
    await fillFromTemplate(template);
  }
};

/**
 * Adds a torrent pasted as a magnet link, such as one from nyaa, and attaches it to the editor so its files can be
 * picked for episodes. It replaces the attached one; picks already made stay with their episodes.
 * @returns Nothing.
 */
const addTorrent = async (): Promise<void> => {
  const addedId = await dialog.showDialog<number>({ component: AddTorrentDialog });

  if (addedId !== undefined) {
    await router.replace({ query: { ...route.query, download: String(addedId) } });
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

// A new show opened from a link elsewhere (a torrent's "Create a show", "+ MAL" on the shows page) starts from that
// link's template
onMounted(async () => {
  const linkedUrl = getQueryString(route.query.template);

  if (showId.value === null && linkedUrl) {
    templateUrl.value = linkedUrl;
    const template = await loadTemplate(linkedUrl);

    // The user may have left while the site answered; filling in then would only pop a snackbar on another page
    if (template && !hasLeftPage) {
      await fillFromTemplate(template);
    }
  }
});

onBeforeUnmount(() => {
  hasLeftPage = true;
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

      <show-editor-skeleton v-else-if="isLoading || isLoadingTemplate || !show" />

      <template v-else>
        <show-editor-hero :show="show">
          <template #actions v-if="show.id">
            <v-btn
              :disabled="isSaving || isDeleting"
              class="glass-panel"
              prepend-icon="mdi-magnet"
              variant="tonal"
              @click="void addTorrent()"
            >
              {{ t('download.addTorrent') }}
            </v-btn>
            <v-btn
              :disabled="isSaving || isDeleting || isReadingLengths"
              :loading="isStartingLengthScan || isReadingLengths"
              class="glass-panel"
              prepend-icon="mdi-timer-sand"
              variant="tonal"
              @click="void readLengths()"
            >
              {{ t('showEditor.readLengths') }}
            </v-btn>
            <v-btn
              :disabled="isSaving || isDeleting"
              :loading="isDeleting"
              class="glass-panel"
              color="error"
              prepend-icon="mdi-trash-can-outline"
              variant="tonal"
              @click="void deleteShow()"
            >
              {{ t('showEditor.deleteShow') }}
            </v-btn>
          </template>
          <template #actions v-else>
            <v-btn class="glass-panel" prepend-icon="mdi-magnet" variant="tonal" @click="void addTorrent()">
              {{ t('download.addTorrent') }}
            </v-btn>
            <v-btn
              class="glass-panel"
              prepend-icon="mdi-link-variant"
              variant="tonal"
              @click="void openTemplateDialog()"
            >
              {{ t('showEditor.template.autofill') }}
            </v-btn>
          </template>
        </show-editor-hero>
        <show-editor v-model:show="show" :download="downloadQuery.data.value ?? null" ref="editor" />
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
