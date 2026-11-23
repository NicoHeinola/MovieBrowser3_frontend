<script setup lang="ts">
import type { ShowEditorDownload } from './ShowEditorDownload';
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
import { useScrollSpy } from '@/composables/scroll/useScrollSpy';
import { DownloadStatus } from '@/enums/download/DownloadStatus';
import { getPickedDownloadFileIndexes } from '@/utils/download/getPickedDownloadFileIndexes';
import { showEditorDownloadKey } from './showEditorDownloadKey';
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

const { download = null } = defineProps<{
  /** A torrent whose files can be picked for episodes, from the link the editor was opened with. */
  download?: Download | null;
}>();

const show = defineModel<Show>('show', { required: true });

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
 * The attached torrent with its files still free to pick: not picked anywhere in this show, nor by another show.
 * Provided to the episode parts, so the parts in between don't pass it on.
 */
const editorDownload = computed<ShowEditorDownload>(() => {
  if (!download) {
    return { download: null, availableFiles: [] };
  }

  const pickedIndexes = getPickedDownloadFileIndexes(show.value.entries ?? [], download.id);
  const availableFiles = (download.files ?? []).filter(
    (file) => !pickedIndexes.has(file.index) && (file.show_id === null || file.show_id === show.value.id),
  );

  return { download, availableFiles };
});

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

defineExpose({ validate });

provide(showEditorDownloadKey, editorDownload);
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
          <!-- The attached torrent, like the settings page's status cards. The icon outside says how to pick its files,
               or why it failed. -->
          <div class="d-flex align-center ga-4 mb-4" v-if="download">
            <v-icon
              :icon="download.status === DownloadStatus.Failed ? 'mdi-alert-circle' : 'mdi-help-circle'"
              v-tooltip:bottom="
                download.status === DownloadStatus.Failed
                  ? t(`download.errorCodes.${download.error_code}`)
                  : t('download.pickFilesHint')
              "
            />
            <download-card :name="download.name" :status="download.status" class="flex-1-1" is-one-line />
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
