<script setup lang="ts">
import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { NekoBtBrowser } from '@/components/features/torrent/nekobt-browser';
import { NyaaSearch } from '@/components/features/torrent/nyaa-search';
import { useStoredTab } from '@/composables/tab/useStoredTab';
import { TorrentSite } from '@/enums/torrent/TorrentSite';

/** One tab per torrent site, since each has its own filters and sorts. The last one used opens next time. */
const site = useStoredTab<TorrentSite>('torrentSite', [TorrentSite.NekoBt, TorrentSite.Nyaa]);
</script>

<template>
  <page-background />

  <page-container class="mb-12">
    <v-row class="mb-4" justify="center">
      <v-col cols="auto">
        <v-tabs v-model="site">
          <v-tab :value="TorrentSite.NekoBt" prepend-icon="mdi-magnify">nekoBT</v-tab>
          <v-tab :value="TorrentSite.Nyaa" prepend-icon="mdi-open-in-new">nyaa</v-tab>
        </v-tabs>
      </v-col>
    </v-row>

    <!--
      The tabs share one search term, the URL's `q`: each reads it when it opens and writes it as you type, so a search
      carries over when you switch tabs.
    -->
    <neko-bt-browser v-if="site === TorrentSite.NekoBt" />
    <nyaa-search v-else />
  </page-container>
</template>
