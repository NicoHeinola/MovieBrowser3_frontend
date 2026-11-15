import { useIntervalFn } from '@vueuse/core';
import { computed, ref, watch } from 'vue';

/** How much of a save is done, in any unit: bytes when files upload, episodes otherwise. */
export interface ShowSaveWork {
  /** Units finished. */
  done: number;
  /** Units in all. */
  total: number;
  /** Units the running request adds when it finishes, such as its file's size. */
  current: number;
}

/** How much of the running request is assumed done at most, as one past its expected time is slower than the rest. */
const MAX_CURRENT_SHARE = 0.9;

/**
 * Estimates how long a running show save still takes, and redoes it every second. The pace comes from the work
 * finished so far, and the running request is assumed to go at that pace, so the estimate counts down. A request that
 * runs past its expected time lowers the pace, so the estimate rises again instead of reaching zero early.
 *
 * @param work - How much of the save is done, or null while there is no progress to count.
 * @returns `secondsLeft`, the estimate in whole seconds, or null until the first unit finishes.
 */
export const useShowSaveTimeLeft = (work: () => ShowSaveWork | null) => {
  const now = ref<number>(Date.now());
  const startedAt = ref<number | null>(null);
  // When the finished work last grew, and to how much.
  const stepAt = ref<number | null>(null);
  const stepDone = ref<number>(0);

  const { pause, resume } = useIntervalFn(
    () => {
      now.value = Date.now();
    },
    1000,
    { immediate: false },
  );

  watch(
    work,
    (value) => {
      // No progress to count: forget the last save, so the next one starts its own clock.
      if (!value) {
        startedAt.value = null;
        stepAt.value = null;
        pause();
        return;
      }

      const time = Date.now();
      now.value = time;

      if (startedAt.value === null) {
        startedAt.value = time;
        stepAt.value = time;
        stepDone.value = value.done;
        resume();
      }

      if (value.done !== stepDone.value) {
        stepAt.value = time;
        stepDone.value = value.done;
      }
    },
    { immediate: true },
  );

  const secondsLeft = computed<number | null>(() => {
    const value = work();

    if (!value || startedAt.value === null || stepAt.value === null) {
      return null;
    }

    const finishedIn = stepAt.value - startedAt.value;

    // Nothing finished yet gives no pace to go on.
    if (value.done <= 0 || finishedIn <= 0) {
      return null;
    }

    if (value.done >= value.total) {
      return 0;
    }

    // Assume the running request goes at the pace so far, capped below its size: past that, it is the slow one.
    const pace = value.done / finishedIn;
    const inFlight = Math.min(pace * (now.value - stepAt.value), value.current * MAX_CURRENT_SHARE);
    // Over the whole save, the pace drops once the cap holds the running request back.
    const overallPace = (value.done + inFlight) / (now.value - startedAt.value);

    return Math.ceil((value.total - value.done - inFlight) / overallPace / 1000);
  });

  return { secondsLeft };
};
