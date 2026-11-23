<script setup lang="ts">
/**
 * The results under a search-as-you-type field: skeleton rows while a search loads, so old results never pass for the
 * new term's, an alert when nothing matches, and otherwise the rows in a list that scrolls on its own. Other `v-list`
 * props, such as `v-model:selected`, go to the list.
 */
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    loading: boolean;
    /** Whether there are no rows to show, which shows `emptyText` once loading ends. */
    isEmpty: boolean;
    /** Leave it out to show nothing for no rows, such as before anything is typed. */
    emptyText?: string;
    maxHeight?: number;
  }>(),
  { emptyText: undefined, maxHeight: 440 },
);

defineSlots<{
  /** Rows shown before the results, even while loading, such as a "new show" row. */
  prepend?: () => unknown;
  /** The result rows. */
  default?: () => unknown;
}>();
</script>

<template>
  <div>
    <v-list
      v-bind="$attrs"
      :style="{ maxHeight: `${props.maxHeight}px` }"
      bg-color="transparent"
      class="pa-0 overflow-y-auto"
      v-if="$slots.prepend || props.loading || !props.isEmpty"
    >
      <slot name="prepend" />

      <template v-if="props.loading">
        <v-skeleton-loader v-for="i in 3" color="transparent" type="list-item-avatar" :key="i" />
      </template>
      <slot v-else />
    </v-list>

    <div class="d-flex justify-center" v-if="!props.loading && props.isEmpty && props.emptyText">
      <v-alert class="flex-0-1" type="info" variant="tonal">{{ props.emptyText }}</v-alert>
    </div>
  </div>
</template>
