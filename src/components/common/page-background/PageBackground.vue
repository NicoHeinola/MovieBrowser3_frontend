<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'bubbles' | 'none';
  }>(),
  {
    variant: 'bubbles',
  },
);
</script>

<template>
  <div
    :class="['page-background position-absolute', `page-background--${props.variant}`]"
    style="padding-top: -64px; top: -64px; min-width: 100vw; height: calc(100% + 64px)"
    v-if="props.variant !== 'none'"
  ></div>
</template>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/styles/settings' as settings;

.page-background {
  pointer-events: none;

  &--bubbles {
    background-color: map.get(settings.$grey, 'darken-4');
    opacity: 0.3;

    mask-image: url('/patterns/bubbles.svg');
    mask-repeat: repeat;
    mask-size: 300px 300px;
  }
}
</style>
