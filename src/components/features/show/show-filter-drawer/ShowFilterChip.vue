<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  text: string;
  icon?: string;
  /** Color of the chip while it is included. */
  color?: string;
}>();

/** Whether the chip's value is included, excluded or not filtered on. */
const state = defineModel<'include' | 'exclude' | null>({
  default: null,
});

const stateColor = computed<string | undefined>(() => {
  if (state.value === 'include') return props.color ?? 'primary';
  if (state.value === 'exclude') return 'error';
  return undefined;
});

const stateIcon = computed<string | undefined>(() => {
  if (state.value === 'include') return 'mdi-check';
  if (state.value === 'exclude') return 'mdi-minus';
  return undefined;
});

/**
 * Moves the chip to its next state: off, then included, then excluded, then off again.
 * @returns void
 */
const cycleState = (): void => {
  if (state.value === null) {
    state.value = 'include';
  } else if (state.value === 'include') {
    state.value = 'exclude';
  } else {
    state.value = null;
  }
};
</script>

<template>
  <v-chip
    :append-icon="stateIcon"
    :color="stateColor"
    :prepend-icon="props.icon"
    :text="props.text"
    :variant="state === 'exclude' ? 'outlined' : 'tonal'"
    @click="cycleState"
  />
</template>
