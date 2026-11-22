<script setup lang="ts">
import type { NekoBtTorrent } from '@/interfaces/api/models/NekoBtTorrent';
import type { DataTableHeader } from 'vuetify';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

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
  { title: '', key: 'actions', align: 'end', sortable: false, width: 190 },
]);

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
    Sorted and paged by the backend; the server table only shows the rows it gets. Rows use plain elements and `title`
    hints instead of chips and tooltip components: a page of tooltips froze the browser on every new page.
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
          <span :title="t('torrents.groups')" v-if="item.groups.length > 0">
            <i class="mdi mdi-account-group" /> {{ item.groups.join(', ') }}
          </span>
          <span :title="t('torrents.uploader')" v-if="item.uploader && !item.groups.includes(item.uploader)">
            <i class="mdi mdi-account" /> {{ item.uploader }}
          </span>
          <neko-bt-language-flags
            :codes="item.audio_languages"
            :label="t('torrents.audio')"
            icon="mdi-volume-high"
            v-if="item.audio_languages.length > 0"
          />
          <neko-bt-language-flags
            :codes="item.subtitle_languages"
            :label="t('torrents.subtitles')"
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

    <template #item.actions="{ item }">
      <div class="d-flex justify-end ga-2">
        <v-btn
          :href="item.magnet_url"
          :title="t('torrents.openMagnet')"
          icon="mdi-magnet"
          size="small"
          variant="text"
        />
        <v-btn
          :title="t('torrents.copyMagnet')"
          icon="mdi-content-copy"
          size="small"
          variant="text"
          @click="void copyMagnet(item)"
        />
        <v-btn
          :href="item.torrent_url"
          :title="t('torrents.downloadTorrent')"
          icon="mdi-download"
          size="small"
          variant="text"
        />
        <v-btn
          :href="item.media_url"
          :title="t('torrents.openMedia')"
          icon="mdi-open-in-new"
          rel="noopener"
          size="small"
          target="_blank"
          variant="text"
          v-if="item.media_url"
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
