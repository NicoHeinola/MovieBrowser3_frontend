<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps<{
  linkEls: HTMLElement[];
  linkPaths: string[];
}>();

const route = useRoute();
const indicatorEl = ref<HTMLElement | null>(null);
const left = ref(0);
const width = ref(0);
// Tracks whether the initial position has been set; CSS transitions are only enabled after this
const initialized = ref(false);
const isSquishing = ref(false);
let resizeObserver: ResizeObserver | null = null;

const activeIndex = computed(() => props.linkPaths.indexOf(route.path));

// Measures the active link's position relative to the container and moves the indicator there.
// On first call (animate=false), position is set instantly to avoid a transition from 0,0.
const updatePosition = (animate: boolean) => {
  const idx = activeIndex.value;
  if (idx < 0 || !props.linkEls[idx] || !indicatorEl.value?.parentElement) return;

  const containerRect = indicatorEl.value.parentElement.getBoundingClientRect();
  const linkRect = props.linkEls[idx].getBoundingClientRect();

  left.value = linkRect.left - containerRect.left;
  width.value = linkRect.width;

  if (!initialized.value) {
    // Wait one tick so the position is applied before enabling transitions
    nextTick(() => {
      initialized.value = true;
    });
    return;
  }

  if (animate) {
    // Reset the squish animation so it can re-trigger even if already playing
    isSquishing.value = false;
    nextTick(() => {
      isSquishing.value = true;
    });
  }
};

const observeLayout = () => {
  resizeObserver?.disconnect();

  if (!indicatorEl.value?.parentElement) return;

  resizeObserver = new ResizeObserver(() => {
    updatePosition(false);
  });

  resizeObserver.observe(indicatorEl.value.parentElement);

  const activeLinkEl = props.linkEls[activeIndex.value];

  if (activeLinkEl) {
    resizeObserver.observe(activeLinkEl);
  }
};

const refreshPosition = (animate: boolean) => {
  updatePosition(animate);
  observeLayout();
};

const handleWindowResize = () => {
  updatePosition(false);
};

watch(activeIndex, () => {
  nextTick(() => {
    refreshPosition(true);
  });
});

watch(
  () => props.linkEls.length,
  () => {
    nextTick(() => {
      refreshPosition(false);
    });
  },
);

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize);
  resizeObserver?.disconnect();
});

onMounted(() => {
  nextTick(() => {
    refreshPosition(false);
    window.addEventListener('resize', handleWindowResize);
  });
});
</script>

<template>
  <div
    :class="{ 'nav-indicator--animate': initialized }"
    :style="{ left: `${left}px`, width: `${width}px`, opacity: initialized && activeIndex >= 0 ? 1 : 0 }"
    class="nav-indicator"
    ref="indicatorEl"
  >
    <div :class="{ 'indicator-bar--squish': isSquishing }" class="indicator-bar" @animationend="isSquishing = false" />
  </div>
</template>

<style lang="scss" scoped>
.nav-indicator {
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

.indicator-bar {
  width: 100%;
  height: 5px;
  border-radius: 3px;
  background: rgb(var(--v-theme-link));
  box-shadow: 0 0 6px rgba(var(--v-theme-link), 0.5);
  &--squish {
    animation: nav-indicator-squish 380ms ease-in-out;
  }
}

@keyframes nav-indicator-squish {
  0% {
    transform: scale(1);
  }

  20% {
    transform: scaleX(1.15) scaleY(0.8);
  }

  55% {
    transform: scaleX(0.9) scaleY(1.15);
  }

  80% {
    transform: scaleX(1.06) scaleY(0.95);
  }

  100% {
    transform: scale(1);
  }
}
</style>
