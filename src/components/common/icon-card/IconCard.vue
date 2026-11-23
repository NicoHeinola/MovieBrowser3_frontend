<script setup lang="ts">
/**
 * A bordered card led by a tonal icon tile, with a title and an optional line under it: the look of the settings
 * page's task cards, also used for a torrent. Anything beside the title goes in `append`, anything under the row (a
 * progress bar) in the default slot.
 */
const props = defineProps<{
  icon: string;
  /** The tile's color, such as `primary` or `error`. */
  color: string;
  title: string;
  /** Under the title, such as a folder or why something failed. */
  text?: string;
  /** Keeps the title on one line, with the full title in a tooltip. */
  isOneLine?: boolean;
}>();

defineSlots<{
  /** Beside the title, such as a count or a status chip. */
  append?: () => unknown;
  /** Under the row, such as a progress bar. */
  default?: () => unknown;
}>();
</script>

<template>
  <v-sheet border="sm" class="d-flex flex-column ga-4 pa-4" color="transparent" rounded="lg">
    <div class="d-flex align-center ga-4">
      <v-avatar :color="props.color" rounded="lg" variant="tonal">
        <v-icon :icon="props.icon" />
      </v-avatar>

      <!-- min-width lets long text wrap or truncate instead of pushing what's beside it off the card -->
      <div class="flex-1-1" style="min-width: 0">
        <div
          class="text-body-large font-weight-medium text-truncate"
          v-tooltip:bottom="props.title"
          v-if="props.isOneLine"
        >
          {{ props.title }}
        </div>
        <div class="text-body-large font-weight-medium text-break" v-else>{{ props.title }}</div>
        <div class="text-body-medium text-medium-emphasis text-break" v-if="props.text">{{ props.text }}</div>
      </div>

      <slot name="append" />
    </div>

    <slot />
  </v-sheet>
</template>
