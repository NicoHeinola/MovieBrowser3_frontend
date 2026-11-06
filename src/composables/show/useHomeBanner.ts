import type { Show } from '@/interfaces/api/models/Show';
import type { MaybeRefOrGetter } from 'vue';

import { useIntervalFn, useTimeoutFn } from '@vueuse/core';
import { computed, ref, toValue, watch } from 'vue';

/** How long, in ms, a hovered show stays on the banner after the pointer leaves. */
const BANNER_SHOW_HOLD_MS = 10_000;

/** How long, in ms, each default background stays on the banner. */
const BANNER_ROTATION_MS = 15_000;

/**
 * Decides what the home banner shows: the hovered show, which fades back out a while after the pointer leaves,
 * or otherwise the default backgrounds, which take turns when there are several.
 * @param backgrounds - The default background urls.
 * @param isShowOpen - Whether the selected show is open, which keeps it on the banner.
 * @returns The selected show, whether the pointer is over one of the banner's show cards, and the background to display.
 */
export const useHomeBanner = (backgrounds: MaybeRefOrGetter<string[]>, isShowOpen: MaybeRefOrGetter<boolean>) => {
  /** The hovered show on the banner, or null when the default backgrounds are up. */
  const selectedShow = ref<Show | null>(null);

  /** Whether the pointer is over one of the banner's show cards, which keeps the selected show up. */
  const isPointerOver = ref<boolean>(false);

  /** Which default background is up. */
  const backgroundIndex = ref<number>(0);

  const { start: startShowHold, stop: stopShowHold } = useTimeoutFn(
    () => {
      selectedShow.value = null;
    },
    BANNER_SHOW_HOLD_MS,
    { immediate: false },
  );

  const { pause: pauseRotation, resume: resumeRotation } = useIntervalFn(
    () => {
      backgroundIndex.value = (backgroundIndex.value + 1) % toValue(backgrounds).length;
    },
    BANNER_ROTATION_MS,
    { immediate: false },
  );

  const background = computed<string | null>(
    () => selectedShow.value?.banner_url || (toValue(backgrounds)[backgroundIndex.value] ?? null),
  );

  const canRotate = computed<boolean>(() => !selectedShow.value && toValue(backgrounds).length > 1);

  // Start from a random background, also when the list arrives after the first render.
  watch(
    () => toValue(backgrounds),
    (list) => {
      backgroundIndex.value = Math.floor(Math.random() * list.length);
    },
    { immediate: true },
  );

  // The countdown runs only while nothing keeps the show on the banner, and starts over each time it can run.
  watch([selectedShow, isPointerOver, () => toValue(isShowOpen)], ([show, isOver, isOpen]) => {
    stopShowHold();

    if (show && !isOver && !isOpen) {
      startShowHold();
    }
  });

  watch(
    canRotate,
    (rotate) => {
      if (rotate) {
        resumeRotation();
      } else {
        pauseRotation();
      }
    },
    { immediate: true },
  );

  return {
    selectedShow,
    isPointerOver,
    background,
  };
};
