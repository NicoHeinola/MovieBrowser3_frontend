<script setup lang="ts">
import { ref } from 'vue';

import { useSettingStore } from '@/stores/setting/useSettingStore';

import { getRules } from './videoSettingsRules';

const videoBasePath = ref<string>('');
const vlcMediaPlayerPath = ref<string>('');

const rules = getRules();

const settingStore = useSettingStore();
</script>

<template>
  <v-row>
    <v-col class="d-flex ga-2 align-center" cols="12">
      <template v-if="settingStore.isLoading">
        <v-skeleton-loader type="text" width="45" />
        <v-skeleton-loader type="text" width="390" />
        <v-skeleton-loader type="text" width="65" />
      </template>
      <template v-else>
        <v-text-field v-model="videoBasePath" :rules="rules.videoBasePath" label="Video base path">
          <template #prepend>
            <v-icon
              icon="mdi-help-circle"
              v-tooltip:bottom="
                'App uses this folder to store and play video files. This folder can contain sub-folders for shows.'
              "
            />
          </template>
        </v-text-field>
        <v-btn>Save</v-btn>
      </template>
    </v-col>
    <v-col class="d-flex ga-2 align-center" cols="12">
      <template v-if="settingStore.isLoading">
        <v-skeleton-loader type="text" width="45" />
        <v-skeleton-loader type="text" width="390" />
        <v-skeleton-loader type="text" width="65" />
      </template>
      <template v-else>
        <v-text-field v-model="vlcMediaPlayerPath" :rules="rules.vlcMediaPlayerPath" label="VLC Media Player path">
          <template #prepend>
            <v-icon icon="mdi-help-circle" v-tooltip:bottom="'Without this, the app cannot play videos.'" />
          </template>
        </v-text-field>
        <v-btn>Save</v-btn>
      </template>
    </v-col>
  </v-row>
</template>
