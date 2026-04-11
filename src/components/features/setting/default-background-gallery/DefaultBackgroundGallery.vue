<script setup lang="ts">
import { computed } from 'vue';

import { useSettingStore } from '@/stores/setting/useSettingStore';

const settingStore = useSettingStore();

const items = computed<Array<{ url: string }>>(() => {
  return settingStore.bannerDefaultBackgrounds.map((url: string) => ({ url }));
});
</script>

<template>
  <v-skeleton-loader type="card" width="390" v-if="settingStore.isLoading" />

  <div class="d-flex" v-else-if="items.length === 0">
    <v-alert class="flex-0-1" type="info" border> No backgrounds available. </v-alert>
  </div>

  <v-row v-else>
    <v-col v-for="item in items" cols="auto" :key="item.url">
      <v-card width="390" border>
        <v-img :src="item.url" height="220" cover />

        <v-card-text>
          <div class="d-flex align-center ga-4">
            <div class="d-flex ga-2 flex-0-1-100 text-truncate">
              <v-icon icon="mdi-image-outline" />

              <a
                :href="item.url"
                class="text-medium-emphasis link text-truncate"
                rel="noopener noreferrer"
                target="_blank"
              >
                {{ item.url }}
              </a>
            </div>

            <div class="flex-0-0">
              <slot :url="item.url" name="actions" />
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
