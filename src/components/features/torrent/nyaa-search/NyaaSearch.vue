<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { SearchFilterDrawer } from '@/components/common/filter-drawer';
import { SearchToolbar } from '@/components/common/search-toolbar';
import { SplitButton } from '@/components/common/split-button';
import { useNyaaSearch } from '@/composables/nyaa/useNyaaSearch';
import { nyaaMirrors } from '@/data/nyaa/nyaaMirrors';
import { nyaaSearchFilterDefinitions } from '@/data/nyaa/nyaaSearchFilterDefinitions';
import { nyaaSortOptions } from '@/data/nyaa/nyaaSortOptions';

const isFilterDrawerVisible = ref<boolean>(false);

const { search, settings, mirror, activeFilterCount, clearFilters, openSearch, openMirror } = useNyaaSearch();
const { t } = useI18n();
</script>

<template>
  <search-toolbar
    v-model:search="search"
    v-model:sort="settings.sort"
    :active-filter-count="activeFilterCount"
    :placeholder="t('torrents.nyaa.searchPlaceholder', { host: mirror.host })"
    :sort-options="nyaaSortOptions"
    @click:filters="isFilterDrawerVisible = true"
    @submit="openSearch"
  >
    <template #append>
      <split-button
        :menu-label="t('torrents.nyaa.mirror')"
        append-icon="mdi-open-in-new"
        color="primary"
        rounded="pill"
        @click="openSearch"
      >
        {{ t('torrents.nyaa.open', { host: mirror.host }) }}

        <template #menu>
          <v-list-subheader>{{ t('torrents.nyaa.mirror') }}</v-list-subheader>
          <v-list-item
            v-for="candidate in nyaaMirrors"
            :active="candidate.host === mirror.host"
            :title="candidate.host"
            @click="settings.mirror = candidate.host"
            :key="candidate.host"
          >
            <template #append>
              <v-btn
                icon="mdi-open-in-new"
                size="x-small"
                variant="text"
                @click.stop="openMirror(candidate)"
                v-tooltip:end="t('torrents.openSite', { site: candidate.host })"
              />
            </template>
          </v-list-item>
        </template>
      </split-button>
    </template>
  </search-toolbar>

  <v-row justify="center">
    <v-col class="d-flex justify-center" cols="12">
      <v-alert class="flex-0-1" type="info" variant="tonal">{{ t('torrents.nyaa.explanation') }}</v-alert>
    </v-col>
  </v-row>

  <!-- nyaa's results open on nyaa, so there is no count to show; the button only closes the drawer. -->
  <search-filter-drawer
    v-model:filters="settings.filters"
    v-model:is-shown="isFilterDrawerVisible"
    :active-filter-count="activeFilterCount"
    :apply-text="t('common.close')"
    :definitions="nyaaSearchFilterDefinitions"
    :is-loading="false"
    :total-results="0"
    @clear="clearFilters"
  />
</template>
