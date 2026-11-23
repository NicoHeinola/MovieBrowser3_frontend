<script setup lang="ts">
import type { NekoBtTorrent } from '@/interfaces/api/models/NekoBtTorrent';
import type { DataTableHeader } from 'vuetify';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { DownloadIntoShowDialog } from '@/components/features/download/download-into-show-dialog';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useCopyText } from '@/composables/clipboard/useCopyText';
import { useDataTableSort } from '@/composables/table/useDataTableSort';
import { formatFileSize } from '@/utils/file/formatFileSize';
import { getNekoBtBadges } from '@/utils/nekobt/getNekoBtBadges';
import { formatDateTime } from '@/utils/time/formatDateTime';
import { NekoBtBadge } from '../nekobt-badge';
import NekoBtLanguageFlags from './NekoBtLanguageFlags.vue';

const props = defineProps<{
  torrents: NekoBtTorrent[];
  /** Shows a placeholder instead of the table, for the first load. */
  isPending: boolean;
  /** Shows the table's loading bar while another page or sort loads. */
  loading: boolean;
  /** Whether filters are active, for the empty table's text. */
  isFiltered: boolean;
}>();

/** Backend sort, such as `-size`; clicking a column header changes it. */
const sort = defineModel<string>('sort', { required: true });

const dialog = useDialog();
const { copyText } = useCopyText();
const { locale, t } = useI18n();
// `best` has no column, so no header shows as sorted while it's picked
const { sortBy } = useDataTableSort(sort, {
  size_bytes: 'size',
  uploaded_at: 'date',
  seeders: 'seeders',
  leechers: 'leechers',
  downloads: 'downloads',
});

const headers = computed<DataTableHeader[]>(() => [
  { title: t('torrents.name'), key: 'title', sortable: false },
  // Wide enough for the title and the sort arrow side by side, with room between neighbors
  { title: t('torrents.size'), key: 'size_bytes', align: 'end', width: 120 },
  { title: t('torrents.uploaded'), key: 'uploaded_at', align: 'end', width: 200 },
  { title: t('torrents.seeders'), key: 'seeders', align: 'end', width: 120 },
  { title: t('torrents.leechers'), key: 'leechers', align: 'end', width: 120 },
  { title: t('torrents.downloads'), key: 'downloads', align: 'end', width: 130 },
  { title: '', key: 'actions', align: 'end', sortable: false, width: 320 },
]);

/**
 * Opens the dialog that sends the torrent into a show; it opens that show's editor itself.
 * @param torrent - The torrent.
 * @returns Nothing.
 */
const openDownloadDialog = async (torrent: NekoBtTorrent): Promise<void> => {
  await dialog.showDialog<void, { torrent: NekoBtTorrent }>({ component: DownloadIntoShowDialog, props: { torrent } });
};

/**
 * Copies a torrent's magnet link, for a torrent client on another machine.
 * @param torrent - The torrent.
 * @returns Nothing.
 */
const copyMagnet = async (torrent: NekoBtTorrent): Promise<void> => {
  await copyText(torrent.magnet_url, { success: t('torrents.magnetCopied') });
};
</script>

<template>
  <v-skeleton-loader type="table-tbody" v-if="props.isPending" />
  <!--
    Sorted and paged by the backend; the server table only shows the rows it gets. Rows have no hover hints: a tooltip
    component per button froze the browser on every new page, and the browser's own `title` hints look out of place.
  -->
  <v-data-table-server
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="props.torrents"
    :items-length="props.torrents.length"
    :items-per-page="-1"
    :loading="props.loading"
    class="torrent-table"
    initial-sort-order="desc"
    hide-default-footer
    hover
    must-sort
    v-else
  >
    <template #item.title="{ item }">
      <div class="d-flex flex-column ga-2 py-2">
        <a
          :href="item.view_url"
          class="text-high-emphasis font-weight-bold text-decoration-none text-break"
          rel="noopener"
          target="_blank"
        >
          {{ item.title }}
        </a>

        <div class="d-flex flex-wrap ga-2">
          <neko-bt-badge v-for="badge in getNekoBtBadges(item)" :badge="badge" :key="badge.key" />
        </div>

        <div class="d-flex flex-wrap align-center ga-4 text-medium-emphasis text-body-small">
          <span v-if="item.groups.length > 0"> <i class="mdi mdi-account-group" /> {{ item.groups.join(', ') }} </span>
          <span v-if="item.uploader && !item.groups.includes(item.uploader)">
            <i class="mdi mdi-account" /> {{ item.uploader }}
          </span>
          <neko-bt-language-flags
            :codes="item.audio_languages"
            icon="mdi-volume-high"
            v-if="item.audio_languages.length > 0"
          />
          <neko-bt-language-flags
            :codes="item.subtitle_languages"
            icon="mdi-subtitles-outline"
            v-if="item.subtitle_languages.length > 0"
          />
        </div>
      </div>
    </template>

    <template #item.size_bytes="{ value }">
      <span class="text-no-wrap font-weight-medium">{{ formatFileSize(value, locale) }}</span>
    </template>

    <template #item.uploaded_at="{ value }">
      <span class="text-no-wrap text-medium-emphasis">{{ formatDateTime(value, locale) }}</span>
    </template>

    <template #item.seeders="{ value }">
      <span :class="value > 0 ? 'text-success' : 'text-medium-emphasis'" class="font-weight-bold">{{ value }}</span>
    </template>

    <template #item.leechers="{ value }">
      <span :class="value > 0 ? 'text-error' : 'text-medium-emphasis'" class="font-weight-bold">{{ value }}</span>
    </template>

    <template #item.downloads="{ value }">
      <span class="text-medium-emphasis">{{ value }}</span>
    </template>

    <!-- What the app does with the torrent first, then the nekoBT page, then the raw links for another client -->
    <template #item.actions="{ item }">
      <div class="d-flex justify-end ga-2">
        <v-btn
          icon="mdi-download-box-outline"
          size="small"
          variant="text"
          @click="void openDownloadDialog(item)"
          v-tooltip:bottom="t('download.addToShow')"
        />
        <!-- Both need the show's nekoBT page. Without one they stay in place, disabled, so every row's buttons line up;
             the tooltip sits on a wrapper, since a disabled button gets no hover. -->
        <span v-tooltip:bottom="item.media_url ? t('torrents.createShow') : t('torrents.noNekoBtPage')">
          <!-- The new-show editor fills itself in from the show's nekoBT page -->
          <v-btn
            :disabled="!item.media_url"
            :to="item.media_url ? { name: 'admin-show-new', query: { template: item.media_url } } : undefined"
            icon="mdi-movie-plus-outline"
            size="small"
            variant="text"
          />
        </span>
        <span v-tooltip:bottom="item.media_url ? t('torrents.openNekoBtPage') : t('torrents.noNekoBtPage')">
          <v-btn
            :disabled="!item.media_url"
            :href="item.media_url ?? undefined"
            icon="mdi-open-in-new"
            rel="noopener"
            size="small"
            target="_blank"
            variant="text"
          />
        </span>
        <v-btn
          :href="item.magnet_url"
          icon="mdi-magnet"
          size="small"
          variant="text"
          v-tooltip:bottom="t('torrents.openMagnet')"
        />
        <v-btn
          icon="mdi-content-copy"
          size="small"
          variant="text"
          @click="void copyMagnet(item)"
          v-tooltip:bottom="t('torrents.copyMagnet')"
        />
        <v-btn
          :href="item.torrent_url"
          icon="mdi-file-download-outline"
          size="small"
          variant="text"
          v-tooltip:bottom="t('torrents.downloadTorrentFile')"
        />
      </div>
    </template>

    <template #no-data>
      {{ props.isFiltered ? t('torrents.noMatch') : t('torrents.none') }}
    </template>
  </v-data-table-server>
</template>

<style scoped lang="scss">
.torrent-table {
  :deep(table) {
    table-layout: fixed;
    width: 100%;
  }
}
</style>
