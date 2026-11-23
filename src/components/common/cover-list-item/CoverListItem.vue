<script setup lang="ts">
/** A list row led by a cover (a show's, an anime's), or an icon of the same size. Other `v-list-item` props and
 * listeners, such as `@click` or `value`, fall through to the row. */
const props = defineProps<{
  title: string;
  subtitle?: string;
  /** The cover; without one the icon shows in its place, so titles still line up. */
  imageUrl?: string | null;
  /** Shown instead of a cover, such as a "new show" row's. */
  icon?: string;
}>();

defineSlots<{
  /** Buttons at the end of the row. */
  append?: () => unknown;
}>();
</script>

<template>
  <v-list-item :subtitle="props.subtitle" :title="props.title">
    <template #prepend>
      <v-img :src="props.imageUrl" class="me-4" height="52" rounded="sm" width="36" cover v-if="props.imageUrl" />
      <v-sheet
        class="d-flex align-center justify-center me-4"
        color="surface-variant"
        height="52"
        rounded="sm"
        width="36"
        v-else
      >
        <v-icon :icon="props.icon ?? 'mdi-image-outline'" size="small" />
      </v-sheet>
    </template>

    <template #append v-if="$slots.append">
      <slot name="append" />
    </template>
  </v-list-item>
</template>
