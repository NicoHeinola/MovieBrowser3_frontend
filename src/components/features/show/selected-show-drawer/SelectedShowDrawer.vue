<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import { useDisplay } from 'vuetify';
import { SectionContainer } from '@/components/common/section-container';
import RelatedShowsPanel from './RelatedShowsPanel.vue';
import SelectedShowEntries from './SelectedShowEntries.vue';
import SelectedShowHero from './SelectedShowHero.vue';

const show = defineModel<Show | null>('show', { required: true });

const isShown = defineModel<boolean>('isShown', {
  default: false,
});

const { xlAndUp } = useDisplay();
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
      <selected-show-entries :entries="show?.entries" :is-shown="isShown" />
      <related-shows-panel v-model:show="show" />
    </section-container>
  </v-navigation-drawer>
</template>
