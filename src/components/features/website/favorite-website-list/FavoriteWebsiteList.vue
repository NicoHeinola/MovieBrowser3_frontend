<script setup lang="ts">
import type { Website } from '@/interfaces/api/models/Website';

import { useI18n } from 'vue-i18n';

import { getWebsiteDisplayName } from '@/utils/website/getWebsiteDisplayName';
import { getWebsiteHostname } from '@/utils/website/getWebsiteHostname';
import { WebsiteIcon } from '../website-icon';

const { t } = useI18n();

const props = defineProps<{
  websites: Website[];
  loading?: boolean;
}>();
</script>

<template>
  <v-row v-if="props.loading">
    <v-col v-for="n in 4" cols="12" sm="6" :key="n">
      <v-skeleton-loader type="list-item-avatar-two-line" />
    </v-col>
  </v-row>

  <v-row v-else-if="props.websites.length > 0">
    <v-col v-for="website in props.websites" cols="12" sm="6" :key="website.id">
      <v-card :href="website.url" class="h-100" rel="noopener noreferrer" target="_blank">
        <v-card-item>
          <template #prepend>
            <website-icon :icon="website.icon" :url="website.url" />
          </template>
          <v-card-title class="text-truncate">{{ getWebsiteDisplayName(website) }}</v-card-title>
          <v-card-subtitle>{{ getWebsiteHostname(website.url) }}</v-card-subtitle>
        </v-card-item>
      </v-card>
    </v-col>
  </v-row>

  <div class="d-flex" v-else>
    <v-alert class="flex-0-1" type="info">
      {{ t('website.noFavorites') }}
      <template #append>
        <v-btn :to="{ name: 'admin-websites' }" color="info" size="small" variant="text">{{ t('nav.websites') }}</v-btn>
      </template>
    </v-alert>
  </div>
</template>
