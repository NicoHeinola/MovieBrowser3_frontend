<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';

import { formatTimeAgoIntl } from '@vueuse/core';
import { useI18n } from 'vue-i18n';

import { ShowListItem } from '../show-list-item';

const { t, locale } = useI18n();

const props = defineProps<{
  shows: Show[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  'click:show': [show: Show];
}>();

/**
 * Describes how long ago a show was added, such as "Added 3 days ago".
 * @param show - The show.
 * @returns The subtitle text.
 */
const getAddedText = (show: Show): string =>
  t('show.added', { time: formatTimeAgoIntl(new Date(show.created_at), { locale: locale.value }) });
</script>

<template>
  <v-skeleton-loader type="list-item-avatar-two-line@8" v-if="props.loading" />

  <v-card v-else-if="props.shows.length > 0">
    <v-list bg-color="transparent">
      <show-list-item
        v-for="show in props.shows"
        :show="show"
        :subtitle="getAddedText(show)"
        @click="emit('click:show', show)"
        :key="show.id"
      />
    </v-list>
  </v-card>

  <div class="d-flex" v-else>
    <v-alert class="flex-0-1" type="info">{{ t('home.noShows') }}</v-alert>
  </div>
</template>
