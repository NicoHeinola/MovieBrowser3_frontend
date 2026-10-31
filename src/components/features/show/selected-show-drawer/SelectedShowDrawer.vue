<script setup lang="ts">
import { useDisplay } from 'vuetify';
import { SectionContainer } from '@/components/common/section-container';
import RelatedShowsPanel from './RelatedShowsPanel.vue';
import SelectedShowEntries from './SelectedShowEntries.vue';
import SelectedShowHero from './SelectedShowHero.vue';
import { useSelectedShow } from './useSelectedShow';

const showId = defineModel<number | null>('showId', { required: true });

const isShown = defineModel<boolean>('isShown', {
  default: false,
});

const { xlAndUp } = useDisplay();
const { isSwitchingShow, show } = useSelectedShow(showId, isShown);
</script>

<template>
  <v-navigation-drawer
    v-model="isShown"
    :width="xlAndUp ? 600 : 400"
    location="right"
    style="height: 100vh !important; top: 0; z-index: 2000"
    temporary
  >
    <selected-show-hero :is-shown="isShown" :show="show" @close="isShown = false" />

    <section-container class="pt-0">
      <selected-show-entries :is-shown="isShown" :show="show" />
      <related-shows-panel v-model:show-id="showId" :is-loading="isSwitchingShow" :show="show" />
    </section-container>
  </v-navigation-drawer>
</template>
