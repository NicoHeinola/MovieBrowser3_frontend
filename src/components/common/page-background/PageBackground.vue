<script setup lang="ts">
import type { CSSProperties } from 'vue';

const props = withDefaults(
  defineProps<{
    patternStyle?: CSSProperties;
    backgroundStyle?: CSSProperties;
    variant?: 'bubbles' | 'jigsaw' | 'none';
  }>(),
  {
    variant: 'bubbles',
  },
);
</script>

<template>
  <div>
    <div
      :class="['page-background position-absolute']"
      :style="[
        { paddingTop: '-64px', top: '-64px', minWidth: '100vw', height: 'calc(100% + 64px)' },
        props.backgroundStyle,
      ]"
      v-if="props.variant !== 'none'"
    />
    <div
      :class="['page-pattern-background position-absolute', `page-pattern-background--${props.variant}`]"
      :style="[
        { paddingTop: '-64px', top: '-64px', minWidth: '100vw', height: 'calc(100% + 64px)' },
        props.patternStyle,
      ]"
      v-if="props.variant !== 'none'"
    />
  </div>
</template>

<style lang="scss" scoped>
.page-pattern-background {
  pointer-events: none;

  &--bubbles {
    background: linear-gradient(
      180deg,
      rgba(var(--v-theme-pattern-start), 0.25) 0,
      rgba(var(--v-theme-pattern-end), 0.2) 2000px
    );
    opacity: 0.15;

    mask-image: url('/patterns/bubbles.svg');
    mask-repeat: repeat;
    mask-size: 900px 900px;
  }

  &--jigsaw {
    background: linear-gradient(
      180deg,
      rgba(var(--v-theme-pattern-end), 0.2) 0,
      rgba(var(--v-theme-pattern-start), 0.15) 2000px
    );
    opacity: 0.3;

    mask-image: url('/patterns/jigsaw.svg');
    mask-repeat: repeat;
    mask-size: 200px 200px;
  }
}

.page-background {
  background: linear-gradient(
    180deg,
    rgb(var(--v-theme-background)) 0,
    rgb(var(--v-theme-background-lighten-1)) 2000px
  );
}
</style>
