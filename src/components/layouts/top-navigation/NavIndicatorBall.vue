<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const BALL_DIAMETER = 10;

const props = defineProps<{
  linkEls: HTMLElement[];
  linkPaths: string[];
}>();

const route = useRoute();
const ballRef = ref<HTMLElement | null>(null);
const ballLeft = ref(0);
const isReady = ref(false);
const isAnimating = ref(false);

const activeIndex = computed(() => props.linkPaths.indexOf(route.path));

const updatePosition = (animate: boolean) => {
  const idx = activeIndex.value;
  if (idx < 0 || !props.linkEls[idx] || !ballRef.value?.parentElement) return;

  const containerRect = ballRef.value.parentElement.getBoundingClientRect();
  const linkRect = props.linkEls[idx].getBoundingClientRect();
  const targetLeft = linkRect.left - containerRect.left + linkRect.width / 2 - BALL_DIAMETER / 2;

  if (!isReady.value) {
    ballLeft.value = targetLeft;
    nextTick(() => {
      isReady.value = true;
    });
    return;
  }

  ballLeft.value = targetLeft;

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
    :style="{ left: `${ballLeft}px`, opacity: isReady && activeIndex >= 0 ? 1 : 0 }"
  >
    <div class="ball-inner" :class="{ 'ball-inner--squish': isAnimating }" @animationend="isAnimating = false" />
  </div>
</template>

<style lang="scss" scoped>
.nav-indicator-ball {
  position: absolute;
  bottom: 4px;
  pointer-events: none;
  transition: opacity 200ms ease;

  &--animate {
    transition:
      left 380ms cubic-bezier(0.4, 0, 0.2, 1),
      opacity 200ms ease;
  }
}

.ball-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgb(var(--v-theme-link));
  box-shadow:
    0 0 6px rgb(var(--v-theme-link)),
    0 0 14px rgba(var(--v-theme-link), 0.5);

  &--squish {
    animation: nav-ball-squish 380ms ease-in-out;
  }
}

@keyframes nav-ball-squish {
  0% {
    transform: scale(1);
  }

  20% {
    transform: scaleX(1.7) scaleY(0.5);
  }

  55% {
    transform: scaleX(0.65) scaleY(1.45);
  }

  80% {
    transform: scaleX(1.2) scaleY(0.85);
  }

  100% {
    transform: scale(1);
  }
}
</style>
