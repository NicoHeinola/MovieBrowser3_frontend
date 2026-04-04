<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps<{
  linkEls: HTMLElement[];
  linkPaths: string[];
}>();

const route = useRoute();
const ballRef = ref<HTMLElement | null>(null);
const ballLeft = ref(0);
const ballWidth = ref(0);
const isReady = ref(false);
const isAnimating = ref(false);

const activeIndex = computed(() => props.linkPaths.indexOf(route.path));

const updatePosition = (animate: boolean) => {
  const idx = activeIndex.value;
  if (idx < 0 || !props.linkEls[idx] || !ballRef.value?.parentElement) return;

  const containerRect = ballRef.value.parentElement.getBoundingClientRect();
  const linkRect = props.linkEls[idx].getBoundingClientRect();
  const targetLeft = linkRect.left - containerRect.left;
  const targetWidth = linkRect.width;

  if (!isReady.value) {
    ballLeft.value = targetLeft;
    ballWidth.value = targetWidth;
    nextTick(() => {
      isReady.value = true;
    });
    return;
  }

  ballLeft.value = targetLeft;
  ballWidth.value = targetWidth;

  if (animate) {
    isAnimating.value = false;
    nextTick(() => {
      isAnimating.value = true;
    });
  }
};

watch(activeIndex, () => {
  updatePosition(true);
});

onMounted(() => {
  nextTick(() => {
    updatePosition(false);
  });
});
</script>

<template>
  <div
    ref="ballRef"
    class="nav-indicator-ball"
    :class="{ 'nav-indicator-ball--animate': isReady }"
    :style="{ left: `${ballLeft}px`, width: `${ballWidth}px`, opacity: isReady && activeIndex >= 0 ? 1 : 0 }"
  >
    <div class="ball-inner" :class="{ 'ball-inner--squish': isAnimating }" @animationend="isAnimating = false" />
  </div>
</template>

<style lang="scss" scoped>
.nav-indicator-ball {
  position: absolute;
  bottom: 8px;
  pointer-events: none;
  transition: opacity 200ms ease;

  &--animate {
    transition:
      left 380ms cubic-bezier(0.4, 0, 0.2, 1),
      width 380ms cubic-bezier(0.4, 0, 0.2, 1),
      opacity 200ms ease;
  }
}

.ball-inner {
  width: 100%;
  height: 5px;
  background: rgb(var(--v-theme-link));
  &--squish {
    animation: nav-ball-squish 380ms ease-in-out;
  }
}

@keyframes nav-ball-squish {
  0% {
    transform: scale(1);
  }

  20% {
    transform: scaleX(1.3) scaleY(0.75);
  }

  55% {
    transform: scaleX(0.85) scaleY(1.2);
  }

  80% {
    transform: scaleX(1.1) scaleY(0.92);
  }

  100% {
    transform: scale(1);
  }
}
</style>
