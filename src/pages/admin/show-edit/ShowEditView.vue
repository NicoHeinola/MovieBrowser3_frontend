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
import { useAPIQueries } from '@/composables/api/useAPIQueries';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { useDownloadCancel } from '@/composables/download/useDownloadCancel';
import { useShowEditor } from '@/composables/show/useShowEditor';
import { useShowTemplate } from '@/composables/show/useShowTemplate';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { useShowVideoFileCheck } from '@/composables/video-file-check/useShowVideoFileCheck';
import { DownloadQueryKey } from '@/enums/query/downloadQueryKey';
import { downloadService } from '@/services/download/downloadService';
import { getUnfinishedDownloadIds } from '@/utils/download/getUnfinishedDownloadIds';
import { isDownloadActive } from '@/utils/download/isDownloadActive';
import { getPollInterval } from '@/utils/query/getPollInterval';
import { getQueryString } from '@/utils/route/getQueryString';
import { getQueryStrings } from '@/utils/route/getQueryStrings';

/** How often a torrent is read again while it moves. */
const DOWNLOAD_POLL_INTERVAL_MS = 2000;

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
const showId = computed<number | null>(() => {
  if (route.name !== 'admin-show-edit') {
    return null;
  }

  return Number(route.params.showId);
});

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
  reload,
  applyTemplate,
} = useShowEditor(showId);
const { cancelDownload } = useDownloadCancel();
const { isLoading: isLoadingTemplate, loadTemplate } = useShowTemplate();

/**
 * The torrents whose files can be picked for episodes, newest first: those the editor was opened with or that were
 * added in it (kept in the link), and those the show's episodes still wait for, so they show their files' progress.
 */
const downloadIds = computed<number[]>(() => {
  const linkedIds = getQueryStrings(route.query.download)
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);
  const waitedIds = getUnfinishedDownloadIds(show.value?.entries ?? []);

  return [...new Set([...linkedIds, ...waitedIds])].toSorted((a, b) => b - a);
});

const downloadQueries = useAPIQueries<Download>(() =>
  downloadIds.value.map((id) => ({
    queryKey: [DownloadQueryKey.ShowEditorDownload, id],
    queryFn: async () => await downloadService.get(id),
    // Follow each while it moves: a magnet's file list comes from peers first, then files download and import
    refetchInterval: (query) =>
      getPollInterval(query.state, (download) => isDownloadActive(download.status), DOWNLOAD_POLL_INTERVAL_MS),
    staleTime: 0,
  })),
);

const downloads = computed<Download[]>(() => downloadQueries.value.flatMap((query) => query.data ?? []));

const { isChecking: isCheckingVideoFiles, checkShow } = useShowVideoFileCheck();

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

  const isValid = await editor.value?.validate();

  if (!isValid) {
    showWarningSnackbar(t('showEditor.fixErrors'));
    return;
  }

  const wasNew = showId.value === null;
  const savedId = await save();

  if (savedId === null) {
    return;
  }

  // A download's status follows its picks, which the save just sent
  for (const downloadQuery of downloadQueries.value) {
    void downloadQuery.refetch();
  }

  // The downloads stay in the URL, so more of their files can still be picked
  if (wasNew) {
    const query = { download: route.query.download };

    await router.replace({ name: 'admin-show-edit', params: { showId: savedId }, query });
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
 * Adds a torrent pasted as a magnet link, such as one from nyaa, next to the editor's others, so its files can be
 * picked for episodes.
 * @returns Nothing.
 */
const addTorrent = async (): Promise<void> => {
  const addedId = await dialog.showDialog<number>({ component: AddTorrentDialog });

  if (addedId !== undefined) {
    const download = [...getQueryStrings(route.query.download), String(addedId)];

    await router.replace({ query: { ...route.query, download } });
  }
};

/**
 * Cancels one of the show's downloads, such as one added by mistake. Cancelling can remove the episodes made for it,
 * so the show loads again afterwards, which needs the draft saved first.
 * @param download - The download.
 * @returns Nothing.
 */
const cancelShowDownload = async (download: Download): Promise<void> => {
  if (hasChanges.value) {
    showWarningSnackbar(t('download.saveBeforeCancel'));
    return;
  }

  const isCancelled = await cancelDownload(download);

  if (!isCancelled) {
    return;
  }

  // Out of the link, so the editor stops following it
  const remainingIds = getQueryStrings(route.query.download).filter((id) => id !== String(download.id));
  await router.replace({ query: { ...route.query, download: remainingIds } });
  await reload();
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
              :disabled="isSaving || isDeleting"
              :loading="isCheckingVideoFiles"
              class="glass-panel"
              prepend-icon="mdi-file-search-outline"
              variant="tonal"
              @click="void checkShow(show.id)"
            >
              {{ t('showEditor.checkVideoFiles') }}
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
        <show-editor v-model:show="show" :downloads="downloads" ref="editor">
          <template #torrent-actions="{ download }">
            <v-btn
              color="error"
              icon="mdi-trash-can"
              size="small"
              variant="text"
              @click="void cancelShowDownload(download)"
              v-tooltip:bottom="t('download.cancel')"
            />
          </template>
        </show-editor>
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
