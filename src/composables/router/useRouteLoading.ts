import { onScopeDispose, ref } from 'vue';
import { useRouter } from 'vue-router';

/**
 * Tracks whether a route navigation (including lazy page loading) is in progress. Navigations that only change the
 * query or hash, such as a search page syncing its filters, stay on the same page and do not count.
 *
 * @returns `isNavigating`, true from the start of a navigation until it finishes or fails.
 */
export const useRouteLoading = () => {
  const router = useRouter();
  const isNavigating = ref<boolean>(false);

  const stopBefore = router.beforeEach((to, from) => {
    if (to.path !== from.path) {
      isNavigating.value = true;
    }
  });
  const stopAfter = router.afterEach(() => {
    isNavigating.value = false;
  });
  const stopError = router.onError(() => {
    isNavigating.value = false;
  });

  onScopeDispose(() => {
    stopBefore();
    stopAfter();
    stopError();
  });

  return { isNavigating };
};
