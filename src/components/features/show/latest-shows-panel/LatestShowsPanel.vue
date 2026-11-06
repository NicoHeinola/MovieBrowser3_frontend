<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';

import { SectionContainer } from '@/components/common/section-container';
import { TitledSection } from '@/components/common/titled-section';
import { ShowGrid } from '@/components/features/show/show-grid';

import { LATEST_SHOWS_MAX_COLS } from './latestShowsMaxCols';

const props = withDefaults(
  defineProps<{
    /** The latest shows, newest first. */
    shows: Show[];
    /** Whether the shows are still loading. */
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);

const emit = defineEmits<{
  (e: 'click:show', value: Show | null): void;
  (e: 'hover:show', value: boolean): void;
}>();

const selectedShow = defineModel<Show | null>('selectedShow', {
  default: null,
});

const { xxl, xlAndUp, lgAndUp, smAndUp } = useDisplay();
const { t } = useI18n();

const maxCols = computed<number>(() => {
  if (xxl.value) return LATEST_SHOWS_MAX_COLS;
  if (xlAndUp.value) return 4;
  if (lgAndUp.value) return 3;
  if (smAndUp.value) return 2;
  return 1;
});
</script>

<template>
  <v-row align="center" style="max-width: 90%">
    <v-sheet border="sm" class="position-relative glass-panel" rounded="xl">
      <section-container>
        <titled-section :title="t('home.latest')" icon="mdi-clock-outline" icon-color="warning"> </titled-section>
        <template v-if="props.loading">
          <div class="d-flex ga-8">
            <v-skeleton-loader v-for="i in maxCols" type="image@2, paragraph" width="300" :key="i" />
          </div>
        </template>
        <template v-else>
          <show-grid
            v-model:selected-show="selectedShow"
            :cols="maxCols"
            :shows="props.shows"
            @click:show="(show: Show | null) => emit('click:show', show)"
            @hover:show="(isHovered: boolean) => emit('hover:show', isHovered)"
          ></show-grid>
          <div class="d-flex" v-if="props.shows.length === 0">
            <v-alert class="flex-0-0" type="info">
              <p class="text-no-wrap">{{ t('home.noShows') }}</p>
            </v-alert>
          </div>
        </template>
      </section-container>
    </v-sheet>
  </v-row>
</template>
