<script setup lang="ts">
import type { ShowEditorDownloads, ShowEditorTorrent } from './ShowEditorDownloads';
import type { ShowEditorSection } from './ShowEditorSection';
import type { Download } from '@/interfaces/api/models/Download';
import type { Show } from '@/interfaces/api/models/Show';
import { computed, nextTick, provide, ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

import { BaseForm } from '@/components/common/base-form';
import { FormCard } from '@/components/common/form-card';
import { SectionLabel } from '@/components/common/section-label';
import { TitledSection } from '@/components/common/titled-section';
import { DownloadCard } from '@/components/features/download/download-card';
import { DownloadProgress } from '@/components/features/download/download-progress';
import { useScrollSpy } from '@/composables/scroll/useScrollSpy';
import { DownloadStatus } from '@/enums/download/DownloadStatus';
import { getDownloadRate } from '@/utils/download/getDownloadRate';
import { getPickedDownloadFileIndexes } from '@/utils/download/getPickedDownloadFileIndexes';
import { hasDownloadProgress } from '@/utils/download/hasDownloadProgress';
import { isDownloadCompleted } from '@/utils/download/isDownloadCompleted';
import { showEditorDownloadsKey } from './showEditorDownloadsKey';
import ShowEditorSectionNav from './ShowEditorSectionNav.vue';
import ShowEntriesFormPart from './ShowEntriesFormPart.vue';
import ShowGeneralFormPart from './ShowGeneralFormPart.vue';
import ShowLinksFormPart from './ShowLinksFormPart.vue';
import ShowUiFormPart from './ShowUiFormPart.vue';

/**
 * Where the sticky table of contents and a section picked from it stop, in pixels from the top of the window: below
 * the fixed 64px navigation bar, with a 24px gap.
 */
const STICKY_TOP = 88;

const { downloads = [] } = defineProps<{
  /** The torrents whose files can be picked for episodes or whose progress the episodes show, newest first. */
  downloads?: Download[];
}>();

const show = defineModel<Show>('show', { required: true });

defineSlots<{
  /** Buttons on each torrent's card above the entries, such as cancel. */
  'torrent-actions'?: (scope: { download: Download }) => unknown;
}>();

/** Each section's form validity; only `false` marks a section, as Vuetify reports null for unchecked fields. */
const validity = ref<Record<'general' | 'media' | 'entries' | 'links', boolean>>({
  general: true,
  media: true,
  entries: true,
  links: true,
});

const generalForm = useTemplateRef<InstanceType<typeof BaseForm>>('generalForm');
const mediaForm = useTemplateRef<InstanceType<typeof BaseForm>>('mediaForm');
const entriesForm = useTemplateRef<InstanceType<typeof BaseForm>>('entriesForm');
const linksForm = useTemplateRef<InstanceType<typeof BaseForm>>('linksForm');

const { t } = useI18n();
const { activeSectionId, scrollToSection } = useScrollSpy(
  ['show-editor-general', 'show-editor-media', 'show-editor-entries', 'show-editor-links'],
  STICKY_TOP,
);

const sections = computed<ShowEditorSection[]>(() => [
  {
    id: 'show-editor-general',
    title: t('showEditor.generalTitle'),
    subtitle: t('showEditor.generalSubtitle'),
    icon: 'mdi-text-box-outline',
    color: 'primary',
    isInvalid: validity.value.general === false,
  },
  {
    id: 'show-editor-media',
    title: t('showEditor.mediaTitle'),
    subtitle: t('showEditor.mediaSubtitle'),
    icon: 'mdi-image-multiple-outline',
    color: 'info',
    isInvalid: validity.value.media === false,
  },
  {
    id: 'show-editor-entries',
    title: t('showEditor.entriesTitle'),
    subtitle: t('showEditor.entriesSubtitle'),
    icon: 'mdi-playlist-play',
    color: 'success',
    count: show.value.entries?.length ?? 0,
    isInvalid: validity.value.entries === false,
  },
  {
    id: 'show-editor-links',
    title: t('showEditor.linksTitle'),
    subtitle: t('showEditor.linksSubtitle'),
    icon: 'mdi-link-variant',
    color: 'warning',
    count: show.value.outgoing_links?.length ?? 0,
    isInvalid: validity.value.links === false,
  },
]);

/**
 * The torrents with their files still free to pick: not picked anywhere in this show, nor by another show. Provided to
 * the episode parts, so the parts in between don't pass them on.
 */
const editorDownloads = computed<ShowEditorDownloads>(() => {
  const torrents = downloads.map((download): ShowEditorTorrent => {
    if (isDownloadCompleted(download.status)) {
      return { download, canPick: false, availableFiles: [] };
    }

    const pickedIndexes = getPickedDownloadFileIndexes(show.value.entries ?? [], download.id);
    const availableFiles = (download.files ?? []).filter(
      (file) => !pickedIndexes.has(file.index) && (file.show_id === null || file.show_id === show.value.id),
    );

    return { download, canPick: true, availableFiles };
  });

  // A magnet's file list comes from peers first, so it has nothing to pick until then
  const pickable = torrents.filter(
    (torrent) => torrent.download.status !== DownloadStatus.FetchingMetadata && torrent.availableFiles.length > 0,
  );

  return { torrents, pickable };
});

/** The torrents shown above the entries: a completed one has nothing left to do here. */
const openTorrents = computed<ShowEditorTorrent[]>(() =>
  editorDownloads.value.torrents.filter((torrent) => torrent.canPick),
);

/** The sections by key, so the template can place each one's heading next to its own form. */
const sectionsByKey = computed(() => {
  const [general, media, entries, links] = sections.value;

  return { general: general!, media: media!, entries: entries!, links: links! };
});

/**
 * Validates every section and scrolls to the first one that fails, so its error messages are in view.
 * @returns Whether every section passes.
 */
const validate = async (): Promise<boolean> => {
  const forms = [generalForm, mediaForm, entriesForm, linksForm];
  const results = await Promise.all(forms.map((form) => form.value?.validate() ?? Promise.resolve(true)));
  const firstInvalidIndex = results.indexOf(false);

  if (firstInvalidIndex === -1) {
    return true;
  }

  // Wait for the messages to render, so the scroll lands on the section at its final height.
  await nextTick();
  scrollToSection(sections.value[firstInvalidIndex]!.id);

  return false;
};

/**
 * The line under a torrent's name while it downloads, like the Downloads page's speed and time left columns.
 * @param download - The torrent.
 * @returns Such as "2.0 MB/s, 5:00 left", only the speed while qBittorrent can't tell the time, or nothing while it
 * doesn't download.
 */
const getTorrentDetails = (download: Download): string | undefined => {
  const rate = getDownloadRate(download);

  if (!rate?.timeLeft) {
    return rate?.speed;
  }

  return t('download.speedAndTimeLeft', { speed: rate.speed, duration: rate.timeLeft });
};

defineExpose({ validate });

provide(showEditorDownloadsKey, editorDownloads);
</script>

<template>
  <v-row>
    <v-col class="d-none d-md-block" cols="12" lg="2" md="3">
      <div :style="{ top: `${STICKY_TOP}px` }" class="position-sticky d-flex flex-column ga-4">
        <section-label :title="t('showEditor.sections')" />
        <show-editor-section-nav :active-id="activeSectionId" :sections="sections" @select="scrollToSection" />
      </div>
    </v-col>

    <v-col cols="12" lg="10" md="9">
      <v-row gap="48">
        <!-- On very wide screens the two short sections share a row, so the page doesn't stretch every field. -->
        <titled-section
          :icon="sectionsByKey.general.icon"
          :icon-color="sectionsByKey.general.color"
          :subtitle="sectionsByKey.general.subtitle"
          :title="sectionsByKey.general.title"
          xl="6"
          id="show-editor-general"
        >
          <form-card>
            <base-form v-model:is-valid="validity.general" id="show-general-form" ref="generalForm">
              <show-general-form-part v-model:show="show" />
            </base-form>
          </form-card>
        </titled-section>

        <titled-section
          :icon="sectionsByKey.media.icon"
          :icon-color="sectionsByKey.media.color"
          :subtitle="sectionsByKey.media.subtitle"
          :title="sectionsByKey.media.title"
          xl="6"
          id="show-editor-media"
        >
          <form-card>
            <base-form v-model:is-valid="validity.media" id="show-media-form" ref="mediaForm">
              <show-ui-form-part v-model:show="show" />
            </base-form>
          </form-card>
        </titled-section>

        <titled-section
          :icon="sectionsByKey.entries.icon"
          :icon-color="sectionsByKey.entries.color"
          :subtitle="sectionsByKey.entries.subtitle"
          :title="sectionsByKey.entries.title"
          id="show-editor-entries"
        >
          <!-- The torrents still in use, like the settings page's status cards, with their progress like the Downloads
               page. The icon outside says how to pick their files, or why one failed. -->
          <div v-for="{ download } in openTorrents" class="d-flex align-center ga-4 mb-4" :key="download.id">
            <v-icon
              :icon="download.status === DownloadStatus.Failed ? 'mdi-alert-circle' : 'mdi-help-circle'"
              v-tooltip:bottom="
                download.status === DownloadStatus.Failed
                  ? t(`download.errorCodes.${download.error_code}`)
                  : t('download.pickFilesHint')
              "
            />
            <download-card
              :details="getTorrentDetails(download)"
              :name="download.name"
              :status="download.status"
              class="flex-1-1"
              is-one-line
            >
              <template #actions v-if="$slots['torrent-actions']">
                <slot :download="download" name="torrent-actions" />
              </template>

              <download-progress :download="download" v-if="hasDownloadProgress(download)" />
            </download-card>
          </div>

          <form-card>
            <base-form v-model:is-valid="validity.entries" id="show-entries-form" ref="entriesForm">
              <show-entries-form-part v-model:show="show" />
            </base-form>
          </form-card>
        </titled-section>

        <titled-section
          :icon="sectionsByKey.links.icon"
          :icon-color="sectionsByKey.links.color"
          :subtitle="sectionsByKey.links.subtitle"
          :title="sectionsByKey.links.title"
          id="show-editor-links"
        >
          <form-card>
            <base-form v-model:is-valid="validity.links" id="show-links-form" ref="linksForm">
              <show-links-form-part v-model:outgoing-links="show.outgoing_links" :show-id="show.id" />
            </base-form>
          </form-card>
        </titled-section>
      </v-row>
    </v-col>
  </v-row>
</template>
