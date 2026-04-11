<script setup lang="ts">
import type { DataTableHeader } from 'vuetify';

import { computed } from 'vue';
import { useSettingStore } from '@/stores/setting/useSettingStore';

const settingStore = useSettingStore();

const headers: Array<DataTableHeader> = [
  {
    title: 'Image',
    key: 'image',
    width: 116,
    sortable: false,
  },
  {
    title: 'Background URL',
    key: 'url',
  },
  {
    title: 'Actions',
    key: 'actions',
    sortable: false,
    align: 'end',
    width: 72,
  },
];

const items = computed<{ url: string }[]>(() => settingStore.bannerDefaultBackgrounds.map((url: string) => ({ url })));
</script>

<template>
  <v-data-table :headers="headers" :items="items" :loading="settingStore.isLoading" class="default-backgrounds-table">
    <template #item.image="{ item }">
      <v-img :src="item.url" class="my-4" cover />
    </template>
    <template #item.url="{ value }">
      <p class="default-backgrounds-table__url text-truncate">{{ value }}</p>
    </template>

    <template #item.actions="{ item }">
      <slot :url="item.url" name="actions" />
    </template>

    <template #no-data> No backgrounds available. </template>
  </v-data-table>
</template>

<style scoped lang="scss">
.default-backgrounds-table {
  :deep(table) {
    table-layout: fixed;
    width: 100%;
  }
}
</style>
