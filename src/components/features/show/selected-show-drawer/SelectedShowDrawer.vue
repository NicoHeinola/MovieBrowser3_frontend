<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onBeforeUnmount, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { SectionContainer } from '@/components/common/section-container';
import { useShowDrawerStore } from '@/stores/show/useShowDrawerStore';
import { useVideoAudioStore } from '@/stores/video/useVideoAudioStore';
import RelatedShowsPanel from './RelatedShowsPanel.vue';
import SelectedShowEntries from './SelectedShowEntries.vue';
import SelectedShowHero from './SelectedShowHero.vue';
import { useSelectedShow } from './useSelectedShow';

const isPreviewAutoMuted = ref<boolean>(false);

/** Releases this drawer's claim on the sound, while it is open. */
let releaseForeground: (() => void) | null = null;

const { xlAndUp } = useDisplay();
const showDrawerStore = useShowDrawerStore();
const { action, isShown, showId } = storeToRefs(showDrawerStore);
const { isSwitchingShow, show } = useSelectedShow(showId, isShown);
const { claimForeground } = useVideoAudioStore();

// While open, the preview here plays in front of the page, so page videos such as the home banner stop for it.
watch(
  isShown,
  (shown) => {
    if (shown) {
      releaseForeground ??= claimForeground();
      return;
    }

    releaseForeground?.();
    releaseForeground = null;
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  releaseForeground?.();
  // The drawer goes away with the navigation, such as on logout, and must not come back open.
  showDrawerStore.close();
});
</script>

<template>
  <v-navigation-drawer
    :model-value="isShown"
    :width="xlAndUp ? 600 : 400"
    class="glass-panel high"
    location="right"
    style="height: 100vh !important; top: 0; z-index: 2000"
    temporary
    @update:model-value="(shown: boolean) => !shown && showDrawerStore.close()"
  >
    <selected-show-hero
      v-model:auto-muted="isPreviewAutoMuted"
      :is-shown="isShown"
      :show="show"
      @close="showDrawerStore.close()"
    >
      <template #actions v-if="action">
        <component :is="action" />
      </template>
    </selected-show-hero>

    <section-container class="pt-0">
      <selected-show-entries :is-shown="isShown" :show="show" @playback-start="isPreviewAutoMuted = true" />
      <related-shows-panel v-model:show-id="showId" :is-loading="isSwitchingShow" :show="show" />
    </section-container>
  </v-navigation-drawer>
</template>
