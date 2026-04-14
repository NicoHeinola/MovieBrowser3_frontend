<script setup lang="ts">
import type { CSSProperties } from 'vue';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

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

const PARALLAX_SPEED = 0.75;

const scrollY = ref(0);

const parallaxStyle = computed<CSSProperties>(() => ({
  transform: `translate3d(0, ${scrollY.value * (1 - PARALLAX_SPEED)}px, 0)`,
}));

const onScroll = (): void => {
  scrollY.value = window.scrollY;
};

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
});
</script>

<template>
  <div
    class="position-absolute overflow-hidden"
    style="top: -64px; min-width: 100vw; height: calc(100% + 64px); pointer-events: none"
    v-if="props.variant !== 'none'"
  >
    <div
      :style="[{ top: '0', minWidth: '100vw', height: '200%' }, parallaxStyle, props.backgroundStyle]"
      class="page-background position-absolute"
    />
    <div
      :class="['page-pattern-background position-absolute', `page-pattern-background--${props.variant}`]"
      :style="[{ top: '0', minWidth: '100vw', height: '200%' }, parallaxStyle, props.patternStyle]"
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
