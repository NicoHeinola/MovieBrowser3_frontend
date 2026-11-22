<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import { SectionContainer } from '@/components/common/section-container';
import { useVideoAudioStore } from '@/stores/video/useVideoAudioStore';
import RelatedShowsPanel from './RelatedShowsPanel.vue';
import SelectedShowEntries from './SelectedShowEntries.vue';
import SelectedShowHero from './SelectedShowHero.vue';
import { useSelectedShow } from './useSelectedShow';

const showId = defineModel<number | null>('showId', { required: true });

const isShown = defineModel<boolean>('isShown', {
  default: false,
});

defineSlots<{
  /** Buttons next to the close button, such as "pick another" for a show the page picked at random. */
  actions?: () => unknown;
}>();

const isPreviewAutoMuted = ref<boolean>(false);

/** Releases this drawer's claim on the sound, while it is open. */
let releaseForeground: (() => void) | null = null;

const { xlAndUp } = useDisplay();
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
});
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
      :is-shown="isShown"
      :show="show"
      @close="isShown = false"
    >
      <template #actions v-if="$slots.actions">
        <slot name="actions" />
      </template>
    </selected-show-hero>

    <section-container class="pt-0">
      <selected-show-entries :is-shown="isShown" :show="show" @playback-start="isPreviewAutoMuted = true" />
      <related-shows-panel v-model:show-id="showId" :is-loading="isSwitchingShow" :show="show" />
    </section-container>
  </v-navigation-drawer>
</template>
