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

/**
 * Moves the chip to its previous state: off, then excluded, then included, then off again.
 * @returns void
 */
const cycleStateBackwards = (): void => {
  if (state.value === null) {
    state.value = 'exclude';
  } else if (state.value === 'exclude') {
    state.value = 'include';
  } else {
    state.value = null;
  }
};

/**
 * Handles a left click: Ctrl (or Cmd) clears the chip, otherwise it cycles forwards.
 * @param event The click event.
 * @returns void
 */
const onClick = (event: KeyboardEvent | MouseEvent): void => {
  if (event.ctrlKey || event.metaKey) {
    state.value = null;
    return;
  }
  cycleState();
};

/**
 * Handles a right click: Ctrl (or Cmd) clears the chip, otherwise it cycles backwards.
 * @param event The context menu event.
 * @returns void
 */
const onContextMenu = (event: MouseEvent): void => {
  event.preventDefault();
  if (event.ctrlKey || event.metaKey) {
    state.value = null;
    return;
  }
  cycleStateBackwards();
};
</script>

<template>
  <v-chip
    :append-icon="stateIcon"
    :color="stateColor"
    :prepend-icon="props.icon"
    :text="props.text"
    :variant="state === 'exclude' ? 'outlined' : 'tonal'"
    @click="onClick"
    @contextmenu="onContextMenu"
  />
</template>
