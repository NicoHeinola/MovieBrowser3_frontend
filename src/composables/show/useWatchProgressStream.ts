import { useDocumentVisibility, useTimeoutFn } from '@vueuse/core';
import { ref, watch } from 'vue';

import { useShowWatchProgressCache } from '@/composables/show/useShowWatchProgressCache';
import { watchProgressStreamService } from '@/services/show/watchProgressStreamService';
import { useAuthStore } from '@/stores/auth/useAuthStore';

/** How long a hidden tab keeps its stream, so quick tab switches neither miss changes nor refetch. */
const HIDDEN_STREAM_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Keeps one watch progress stream open while a user is logged in and mirrors its changes onto the cached show lists.
 * A tab hidden for a while closes its stream to free a backend worker and refetches the show lists when it returns.
 * Call it once, from the app root; the stream closes on logout and when the calling scope is disposed.
 * @returns void
 */
export const useWatchProgressStream = (): void => {
  /** Whether the tab has been hidden long enough to close the stream. */
  const isAway = ref<boolean>(false);
  /** The token whose stream has opened before; the next open for it is a reconnect that may have missed changes. */
  let streamedToken: string | null = null;

  const authStore = useAuthStore();
  const visibility = useDocumentVisibility();
  const { applyWatchProgress, refetchShowLists } = useShowWatchProgressCache();
  const { start: startAwayTimeout, stop: stopAwayTimeout } = useTimeoutFn(
    () => {
      isAway.value = true;
    },
    HIDDEN_STREAM_TIMEOUT_MS,
    { immediate: false },
  );

  watch(
    visibility,
    (state) => {
      if (state === 'hidden') {
        startAwayTimeout();
        return;
      }

      stopAwayTimeout();
      isAway.value = false;
    },
    { immediate: true },
  );

  watch(
    () => [authStore.token, isAway.value] as const,
    ([token, away], _previous, onCleanup) => {
      if (!token || away) {
        return;
      }

      const controller = new AbortController();

      onCleanup(() => controller.abort());

      void watchProgressStreamService
        .subscribe({
          token,
          signal: controller.signal,
          onOpen: () => {
            /** Changes made while disconnected are not replayed, so a reconnect refetches what they may have touched. */
            if (streamedToken === token) {
              refetchShowLists();
            }
            streamedToken = token;
          },
          onWatchProgress: applyWatchProgress,
        })
        .catch(() => {
          /** A rejected token ends the stream; the API client's 401 handling logs the user out on the next request. */
        });
    },
    { immediate: true },
  );
};
