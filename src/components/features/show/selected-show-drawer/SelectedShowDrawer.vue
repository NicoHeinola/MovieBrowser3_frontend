<script setup lang="ts">
import { ref } from 'vue';
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

const props = defineProps<{
  /** Shows a "pick another" button, for a show the page picked at random. */
  canPickAnother?: boolean;
  /** Shows the "pick another" button loading while the next pick loads. */
  isPickingAnother?: boolean;
}>();

const emit = defineEmits<{
  'click:pick-another': [];
}>();

const isPreviewAutoMuted = ref<boolean>(false);

const { xlAndUp } = useDisplay();
const { isSwitchingShow, show } = useSelectedShow(showId, isShown);
</script>

<template>
  <v-navigation-drawer
    v-model="isShown"
    :width="xlAndUp ? 600 : 400"
    class="glass-panel high"
    location="right"
    style="height: 100vh !important; top: 0; z-index: 2000"
    temporary
  >
    <selected-show-hero
      v-model:auto-muted="isPreviewAutoMuted"
      :can-pick-another="props.canPickAnother"
      :is-picking-another="props.isPickingAnother"
      :is-shown="isShown"
      :show="show"
      @click:pick-another="emit('click:pick-another')"
      @close="isShown = false"
    />

    <section-container class="pt-0">
      <selected-show-entries :is-shown="isShown" :show="show" @playback-start="isPreviewAutoMuted = true" />
      <related-shows-panel v-model:show-id="showId" :is-loading="isSwitchingShow" :show="show" />
    </section-container>
  </v-navigation-drawer>
</template>
