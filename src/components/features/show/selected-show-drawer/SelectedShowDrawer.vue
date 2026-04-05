<script setup lang="ts">
import type { Show } from '@/interfaces/api/Show';
import { computed } from 'vue';

export interface SelectedShowDrawerProps {
  modelValue: boolean;
  show: Show | null;
}

const props = defineProps<SelectedShowDrawerProps>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const displayTitle = computed(() => {
  if (!props.show) return 'Selected show';
  return props.show.titles.find((title) => title.is_primary)?.title ?? props.show.titles[0]?.title ?? 'Selected show';
});

const closeDrawer = () => {
  emit('update:modelValue', false);
};
</script>

<template>
  <v-navigation-drawer
    :model-value="props.modelValue"
    class="selected-show-drawer"
    location="right"
    style="height: 100vh !important; top: 0; z-index: 2000"
    width="500"
    temporary
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="selected-show-drawer__surface h-100 d-flex flex-column">
      <div class="selected-show-drawer__hero position-relative">
        <v-img
          :src="props.show.banner_url || props.show.card_image_url"
          class="selected-show-drawer__image"
          height="100%"
          cover
          v-if="props.show"
        />
        <div class="selected-show-drawer__overlay position-absolute top-0 left-0 w-100 h-100"></div>
        <div class="position-absolute top-0 right-0 pa-4">
          <v-btn color="white" icon="mdi-close" variant="tonal" @click="closeDrawer" />
        </div>
        <div class="selected-show-drawer__headline position-absolute bottom-0 left-0 w-100 pa-6">
          <v-chip color="red-darken-1" size="small" variant="flat">Now selected</v-chip>
          <h2 class="text-h4 font-weight-bold mt-4">{{ displayTitle }}</h2>
          <p class="text-body-1 text-medium-emphasis mt-3 mb-0">
            Pick up where you left off or keep exploring this title.
          </p>
        </div>
      </div>

      <div class="pa-6 d-flex flex-column ga-4">
        <v-card color="surface-variant" rounded="xl" variant="tonal">
          <v-card-text class="d-flex align-center justify-space-between ga-4">
            <div>
              <div class="text-overline">Preview availability</div>
              <div class="text-body-1 font-weight-medium">
                {{ props.show?.preview_url ? 'Trailer ready to watch' : 'No trailer available yet' }}
              </div>
            </div>
            <v-icon :icon="props.show?.preview_url ? 'mdi-play-circle-outline' : 'mdi-information-outline'" size="32" />
          </v-card-text>
        </v-card>

        <v-btn color="red-darken-1" prepend-icon="mdi-play" size="large" variant="flat" block>
          Continue watching
        </v-btn>

        <v-btn prepend-icon="mdi-close" size="large" variant="text" block @click="closeDrawer"> Close </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<style lang="scss" scoped>
.selected-show-drawer {
  background: #0f1014;
}

.selected-show-drawer__surface {
  background:
    radial-gradient(circle at top, rgba(229, 57, 53, 0.2), transparent 45%),
    linear-gradient(180deg, #171922 0%, #0f1014 100%);
}

.selected-show-drawer__hero {
  min-height: 22rem;
}

.selected-show-drawer__image {
  height: 100%;
  filter: brightness(0.45);
}

.selected-show-drawer__overlay {
  background: linear-gradient(180deg, rgba(8, 9, 13, 0.1) 0%, rgba(8, 9, 13, 0.9) 100%);
}

.selected-show-drawer__headline {
  color: white;
}
</style>
