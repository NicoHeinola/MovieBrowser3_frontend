<script setup lang="ts">
import { computed } from 'vue';

import { useSettingStore } from '@/stores/setting/useSettingStore';

const settingStore = useSettingStore();

const headers = [
  { title: 'Background URL', key: 'url' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
];

const items = computed(() => settingStore.bannerDefaultBackgrounds.map((url) => ({ url })));
</script>

<template>
  <v-data-table :headers="headers" :items="items" :loading="settingStore.isLoading" flat>
    <template #item.url="{ value }">
      <div class="d-flex align-center py-2">
        <v-avatar class="mr-3" rounded="0" size="40">
          <v-img :src="value" cover />
        </v-avatar>
        <span class="text-truncate">{{ value }}</span>
      </div>
    </template>

    <template #item.actions>
      <v-btn color="error" icon="mdi-delete" size="small" variant="text" disabled />
    </template>

    <template #no-data> No backgrounds available. </template>
  </v-data-table>
</template>
