<script setup lang="ts">
import { onMounted } from 'vue';

import PageContainer from '@/components/common/page-container/PageContainer.vue';
import TitledSection from '@/components/common/titled-section/TitledSection.vue';
import { DefaultBackgroundsTable } from '@/components/features/setting/default-backgrounds-table';
import { DefaultVideosTable } from '@/components/features/setting/default-videos-table';
import { useSettingStore } from '@/stores/setting/useSettingStore';

const settingStore = useSettingStore();

onMounted(async () => {
  await settingStore.fetchSettings();
});
</script>

<template>
  <page-container class="fill-height">
    <v-row>
      <v-col cols="12" md="6">
        <titled-section title="Default Banner Videos">
          <default-videos-table hide-default-footer />
          <template #append>
            <div class="d-flex flex-1-1 justify-end">
              <v-btn icon="mdi-plus"></v-btn>
            </div>
          </template>
        </titled-section>
      </v-col>
      <v-col cols="12" md="6">
        <titled-section title="Default Banner Backgrounds">
          <default-backgrounds-table hide-default-footer />
          <template #append>
            <div class="d-flex flex-1-1 justify-end">
              <v-btn icon="mdi-plus"></v-btn>
            </div>
          </template>
        </titled-section>
      </v-col>
    </v-row>
  </page-container>
</template>
