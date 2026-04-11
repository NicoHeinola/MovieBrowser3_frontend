<script setup lang="ts">
import { computed } from 'vue';

import { useSettingStore } from '@/stores/setting/useSettingStore';

const settingStore = useSettingStore();

const headers = [
  { title: 'Video URL', key: 'url' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
];

const items = computed(() => settingStore.bannerDefaultVideos.map((url) => ({ url })));
</script>

<template>
  <v-data-table :headers="headers" :items="items" :loading="settingStore.isLoading">
    <template #item.url="{ value }">
      <div class="d-flex align-center">
        <v-icon class="mr-2" icon="mdi-video" />
        <span class="text-truncate">{{ value }}</span>
      </div>
    </template>

    <template #item.actions>
      <v-btn color="error" icon="mdi-delete" size="small" variant="text" disabled />
    </template>

    <template #no-data> No videos available. </template>
  </v-data-table>
</template>
